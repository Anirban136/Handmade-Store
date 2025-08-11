# 🖼️ How to Add Your Own Product Images

## ✅ **Current Status**
The website is now working with online images from Unsplash. You can see all products with images at **http://localhost:3001**

## 📁 **To Add Your Own Images:**

### **Step 1: Prepare Your Images**
- **Format:** JPG, PNG, or WebP
- **Size:** 400x400 pixels minimum (square recommended)
- **Quality:** High resolution
- **File size:** Under 500KB each

### **Step 2: Add Images to Project**
1. Copy your product photos to: `handmade-store/public/images/`
2. Rename them to match the product names:
   - `ceramic-mug.jpg`
   - `cotton-blanket.jpg`
   - `silver-necklace.jpg`
   - `wooden-board.jpg`
   - `canvas-art.jpg`
   - `leather-journal.jpg`
   - `knitted-scarf.jpg`
   - `ceramic-planters.jpg`

### **Step 3: Update Product Data**
Edit `src/data/products.js` and change the image paths:

```javascript
// Change from:
image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop"

// To:
image: "/images/ceramic-mug.jpg"
```

### **Step 4: Restart Server**
Run `npm start` to see your images!

## 🔄 **Alternative: Use Different Online Images**
You can also replace the Unsplash URLs with any other image URLs:

```javascript
image: "https://your-image-url.com/product-image.jpg"
```

## 📱 **Image Display Features**
- ✅ Responsive design
- ✅ Hover zoom effects
- ✅ Fast loading
- ✅ Accessible alt text

## 🆘 **Need Help?**
If images don't show:
1. Check file names match exactly
2. Ensure images are in `public/images/` folder
3. Restart the development server
4. Clear browser cache 