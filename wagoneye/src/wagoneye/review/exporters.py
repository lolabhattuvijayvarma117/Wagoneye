"""Exporters for human review queue into CVAT XML and COCO JSON formats."""

import json
import shutil
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import List, Optional
from xml.dom import minidom
from wagoneye.review.queue import ReviewItem


def export_cvat_xml(
    items: List[ReviewItem],
    output_xml_path: str | Path,
    task_name: str = "WagonEye Review Queue",
    default_width: int = 640,
    default_height: int = 480,
    export_thumbnails_dir: Optional[str | Path] = None,
) -> Path:
    """Exports review queue items as a CVAT 1.1 XML annotation file."""
    output_xml_path = Path(output_xml_path)
    output_xml_path.parent.mkdir(parents=True, exist_ok=True)

    if export_thumbnails_dir:
        thumb_dest = Path(export_thumbnails_dir)
        thumb_dest.mkdir(parents=True, exist_ok=True)
    else:
        thumb_dest = None

    root = ET.Element("annotations")
    version = ET.SubElement(root, "version")
    version.text = "1.1"

    meta = ET.SubElement(root, "meta")
    task = ET.SubElement(meta, "task")
    t_id = ET.SubElement(task, "id")
    t_id.text = "1"
    t_name = ET.SubElement(task, "name")
    t_name.text = task_name
    t_size = ET.SubElement(task, "size")
    t_size.text = str(len(items))
    mode = ET.SubElement(task, "mode")
    mode.text = "annotation"

    labels = ET.SubElement(task, "labels")
    lbl = ET.SubElement(labels, "label")
    lbl_name = ET.SubElement(lbl, "name")
    lbl_name.text = "bag"

    # Add attributes to label
    attrs = ET.SubElement(lbl, "attributes")
    for attr_name in ["confidence", "direction", "review_reason", "wagon_id"]:
        attr = ET.SubElement(attrs, "attribute")
        aname = ET.SubElement(attr, "name")
        aname.text = attr_name
        atype = ET.SubElement(attr, "input_type")
        atype.text = "text"

    for idx, item in enumerate(items):
        ev = item.event
        img_name = f"{item.item_id}_{ev.wagon_id}_tr{ev.track_id}.jpg"
        if item.thumbnail_path and Path(item.thumbnail_path).exists():
            orig_path = Path(item.thumbnail_path)
            img_name = orig_path.name
            if thumb_dest:
                shutil.copy2(orig_path, thumb_dest / img_name)

        image_el = ET.SubElement(
            root,
            "image",
            id=str(idx),
            name=img_name,
            width=str(default_width),
            height=str(default_height),
        )

        x1, y1, x2, y2 = ev.box
        box_el = ET.SubElement(
            image_el,
            "box",
            label="bag",
            occluded="0",
            xtl=f"{x1:.2f}",
            ytl=f"{y1:.2f}",
            xbr=f"{x2:.2f}",
            ybr=f"{y2:.2f}",
            z_order="0",
        )

        for aname, aval in [
            ("confidence", f"{ev.confidence:.3f}"),
            ("direction", ev.direction),
            ("review_reason", item.reason),
            ("wagon_id", ev.wagon_id),
        ]:
            att_el = ET.SubElement(box_el, "attribute", name=aname)
            att_el.text = str(aval)

    # Format pretty XML
    rough_string = ET.tostring(root, "utf-8")
    reparsed = minidom.parseString(rough_string)
    pretty_xml = reparsed.toprettyxml(indent="  ")

    with open(output_xml_path, "w", encoding="utf-8") as f:
        f.write(pretty_xml)

    return output_xml_path


def export_coco_json(
    items: List[ReviewItem],
    output_json_path: str | Path,
    default_width: int = 640,
    default_height: int = 480,
    export_thumbnails_dir: Optional[str | Path] = None,
) -> Path:
    """Exports review queue items into MS COCO JSON format."""
    output_json_path = Path(output_json_path)
    output_json_path.parent.mkdir(parents=True, exist_ok=True)

    if export_thumbnails_dir:
        thumb_dest = Path(export_thumbnails_dir)
        thumb_dest.mkdir(parents=True, exist_ok=True)
    else:
        thumb_dest = None

    coco: dict = {
        "info": {
            "description": "WagonEye Review Queue Dataset",
            "version": "1.0",
            "year": 2026,
            "contributor": "WagonEye CV Pipeline",
        },
        "licenses": [],
        "categories": [
            {"id": 1, "name": "bag", "supercategory": "cargo"}
        ],
        "images": [],
        "annotations": [],
    }

    for idx, item in enumerate(items, start=1):
        ev = item.event
        img_name = f"{item.item_id}_{ev.wagon_id}_tr{ev.track_id}.jpg"
        if item.thumbnail_path and Path(item.thumbnail_path).exists():
            orig_path = Path(item.thumbnail_path)
            img_name = orig_path.name
            if thumb_dest:
                shutil.copy2(orig_path, thumb_dest / img_name)

        coco["images"].append(
            {
                "id": idx,
                "file_name": img_name,
                "width": default_width,
                "height": default_height,
                "date_captured": ev.timestamp.isoformat(),
            }
        )

        x1, y1, x2, y2 = ev.box
        w = max(0.0, x2 - x1)
        h = max(0.0, y2 - y1)
        area = w * h

        coco["annotations"].append(
            {
                "id": idx,
                "image_id": idx,
                "category_id": 1,
                "bbox": [round(x1, 2), round(y1, 2), round(w, 2), round(h, 2)],
                "area": round(area, 2),
                "iscrowd": 0,
                "score": ev.confidence,
                "attributes": {
                    "item_id": item.item_id,
                    "direction": ev.direction,
                    "review_reason": item.reason,
                    "details": item.details,
                    "wagon_id": ev.wagon_id,
                    "door_id": ev.door_id,
                    "track_id": ev.track_id,
                },
            }
        )

    with open(output_json_path, "w", encoding="utf-8") as f:
        json.dump(coco, f, indent=2)

    return output_json_path
