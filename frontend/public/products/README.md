# Product images

Add the product images referenced by `src/catalog/catalog.ts` in this folder.

Recommended format: JPG or WebP, 800x800 or larger, with the product centered on a light background. The catalog works without the files and hides a missing image until the corresponding asset is uploaded.

"C:\Users\crist\Downloads\cafe-pyme.jpg"
"C:\Users\crist\Downloads\cafe-premium.jpg"
"C:\Users\crist\Downloads\cafe-dia.jpg"
"C:\Users\crist\Downloads\cafe-blend.jpg"
"C:\Users\crist\Downloads\cafe-tostado.jpg"

Copy-Item "C:\Users\crist\Downloads\cafe-pyme.jpg" `
  "frontend\public\products\cafe-pyme.jpg"

  Copy-Item "C:\Users\crist\Downloads\cafe-premium.jpg" `
  "frontend\public\products\cafe-premium.jpg"

  Copy-Item "C:\Users\crist\Downloads\cafe-dia.jpg" `
  "frontend\public\products\cafe-dia.jpg"

  Copy-Item "C:\Users\crist\Downloads\cafe-blend.jpg" `
  "frontend\public\products\cafe-blend.jpg"

  Copy-Item "C:\Users\crist\Downloads\cafe-tostado.jpg" `
  "frontend\public\products\cafe-tostado.jpg"