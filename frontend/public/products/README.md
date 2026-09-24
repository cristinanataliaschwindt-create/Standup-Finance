# Product images

Copy the image files into this folder. The filename must match the `image` value in `src/catalog/catalog.ts`.

Current files referenced by the catalog:

```text
cafe Nescafe Gold 95g.jpg
cafe-pyme.jpg
cafe-tostado.jpg
cafe-blend.jpg
cafe-dia.jpg
yerba-premium.jpg
yerba-carrefour.jpg
yerba-coto.jpg
yerba-dia.jpg
fideos-premium.jpg
fideos-carrefour.jpg
fideos-coto.jpg
fideos-dia.jpg
```

Recommended format: JPG or WebP, 800x800 or larger, with the product centered on a light background. Missing files do not break the catalog; the image area is hidden until the asset is uploaded.

Example PowerShell command:

```powershell
Copy-Item "C:\Users\crist\Downloads\cafe Nescafe Gold 95g.jpg" `
  "frontend\public\products\cafe Nescafe Gold 95g.jpg"
```
  