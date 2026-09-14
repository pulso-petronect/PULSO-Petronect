from pathlib import Path

import fitz


source = Path("attached_assets/Site_Verde_e_Bege_de_Terapeuta_Holística_Estilo_Moderno_1789399955835.pdf")
output_dir = Path(".agents/outputs/pulso-reference")
output_dir.mkdir(parents=True, exist_ok=True)

document = fitz.open(source)
for page_number, page in enumerate(document, start=1):
    pixmap = page.get_pixmap(matrix=fitz.Matrix(1.8, 1.8), alpha=False)
    pixmap.save(output_dir / f"page-{page_number:02d}.png")

print(f"Rendered {document.page_count} pages to {output_dir}")