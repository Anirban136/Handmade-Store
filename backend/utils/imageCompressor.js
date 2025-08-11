const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

class ImageCompressor {
  constructor() {
    // Default compression settings
    this.defaultSettings = {
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 85,
      format: 'webp', // Convert to WebP for better compression
      progressive: true,
      optimizeCoding: true
    };
    
    // Different quality presets for different use cases
    this.presets = {
      thumbnail: { width: 150, height: 150, quality: 80, format: 'webp' },
      small: { width: 400, height: 400, quality: 85, format: 'webp' },
      medium: { width: 800, height: 800, quality: 90, format: 'webp' },
      large: { width: 1200, height: 1200, quality: 95, format: 'webp' },
      original: { quality: 95, format: 'webp' } // Keep original dimensions
    };
  }

  /**
   * Compress a single image with smart optimization
   * @param {string} inputPath - Path to input image
   * @param {string} outputPath - Path to save compressed image
   * @param {Object} options - Compression options
   * @returns {Promise<Object>} - Compression result with metadata
   */
  async compressImage(inputPath, outputPath, options = {}) {
    try {
      const settings = { ...this.defaultSettings, ...options };
      
      // Get image metadata
      const metadata = await sharp(inputPath).metadata();
      
      // Calculate optimal dimensions
      const { width, height } = this.calculateOptimalDimensions(
        metadata.width, 
        metadata.height, 
        settings.maxWidth, 
        settings.maxHeight
      );
      
      // Create compression pipeline
      let pipeline = sharp(inputPath);
      
      // Resize if needed
      if (width && height) {
        pipeline = pipeline.resize(width, height, {
          fit: 'inside', // Maintain aspect ratio
          withoutEnlargement: true, // Don't enlarge small images
          background: { r: 255, g: 255, b: 255, alpha: 1 } // White background
        });
      }
      
      // Apply compression based on format
      if (settings.format === 'webp') {
        pipeline = pipeline.webp({
          quality: settings.quality,
          effort: 6, // Higher effort = better compression
          nearLossless: false,
          smartSubsample: true
        });
      } else if (settings.format === 'jpeg') {
        pipeline = pipeline.jpeg({
          quality: settings.quality,
          progressive: settings.progressive,
          optimizeCoding: settings.optimizeCoding,
          mozjpeg: true // Use MozJPEG for better compression
        });
      } else if (settings.format === 'png') {
        pipeline = pipeline.png({
          quality: settings.quality,
          progressive: settings.progressive,
          compressionLevel: 9, // Maximum compression
          adaptiveFiltering: true
        });
      }
      
      // Apply additional optimizations
      if (settings.optimizeCoding) {
        pipeline = pipeline.rotate(); // Auto-rotate based on EXIF
      }
      
      // Save compressed image
      await pipeline.toFile(outputPath);
      
      // Get compressed file stats
      const compressedStats = fs.statSync(outputPath);
      const originalStats = fs.statSync(inputPath);
      
      // Calculate compression ratio
      const compressionRatio = ((originalStats.size - compressedStats.size) / originalStats.size * 100).toFixed(2);
      
      return {
        success: true,
        originalSize: originalStats.size,
        compressedSize: compressedStats.size,
        compressionRatio: `${compressionRatio}%`,
        dimensions: { width, height },
        format: settings.format,
        outputPath
      };
      
    } catch (error) {
      console.error('Image compression error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Compress multiple images with different presets
   * @param {string} inputPath - Path to input image
   * @param {string} outputDir - Directory to save compressed versions
   * @param {string} filename - Base filename without extension
   * @returns {Promise<Object>} - Results for all compressed versions
   */
  async compressMultipleVersions(inputPath, outputDir, filename) {
    const results = {};
    
    try {
      // Ensure output directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Compress with each preset
      for (const [presetName, preset] of Object.entries(this.presets)) {
        const outputPath = path.join(outputDir, `${filename}-${presetName}.webp`);
        
        const result = await this.compressImage(inputPath, outputPath, preset);
        results[presetName] = result;
        
        // If compression failed, try with original format
        if (!result.success) {
          const fallbackFormat = path.extname(inputPath).substring(1);
          const fallbackPath = path.join(outputDir, `${filename}-${presetName}.${fallbackFormat}`);
          results[presetName] = await this.compressImage(inputPath, fallbackPath, {
            ...preset,
            format: fallbackFormat
          });
        }
      }
      
      return {
        success: true,
        results,
        totalFiles: Object.keys(results).length
      };
      
    } catch (error) {
      console.error('Multiple version compression error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Calculate optimal dimensions while maintaining aspect ratio
   * @param {number} originalWidth - Original image width
   * @param {number} originalHeight - Original image height
   * @param {number} maxWidth - Maximum allowed width
   * @param {number} maxHeight - Maximum allowed height
   * @returns {Object} - Optimal width and height
   */
  calculateOptimalDimensions(originalWidth, originalHeight, maxWidth, maxHeight) {
    if (!maxWidth && !maxHeight) {
      return { width: null, height: null }; // Keep original dimensions
    }
    
    let width = originalWidth;
    let height = originalHeight;
    
    // Calculate scaling factors
    const scaleX = maxWidth ? maxWidth / originalWidth : 1;
    const scaleY = maxHeight ? maxHeight / originalHeight : 1;
    
    // Use the smaller scale to maintain aspect ratio
    const scale = Math.min(scaleX, scaleY);
    
    // Only scale down, never up
    if (scale < 1) {
      width = Math.round(originalWidth * scale);
      height = Math.round(originalHeight * scale);
    }
    
    return { width, height };
  }

  /**
   * Get compression recommendations based on image type and size
   * @param {string} inputPath - Path to input image
   * @returns {Promise<Object>} - Compression recommendations
   */
  async getCompressionRecommendations(inputPath) {
    try {
      const metadata = await sharp(inputPath).metadata();
      const stats = fs.statSync(inputPath);
      const fileSizeMB = stats.size / (1024 * 1024);
      
      let recommendations = {
        currentSize: `${fileSizeMB.toFixed(2)} MB`,
        dimensions: `${metadata.width} × ${metadata.height}`,
        format: metadata.format,
        suggestedActions: []
      };
      
      // Size-based recommendations
      if (fileSizeMB > 2) {
        recommendations.suggestedActions.push('High compression recommended (quality: 70-80)');
      } else if (fileSizeMB > 1) {
        recommendations.suggestedActions.push('Medium compression recommended (quality: 80-90)');
      } else {
        recommendations.suggestedActions.push('Light compression recommended (quality: 90-95)');
      }
      
      // Dimension-based recommendations
      if (metadata.width > 1200 || metadata.height > 1200) {
        recommendations.suggestedActions.push('Resize to max 1200px for web optimization');
      }
      
      // Format-based recommendations
      if (metadata.format !== 'webp') {
        recommendations.suggestedActions.push('Convert to WebP for better compression');
      }
      
      return recommendations;
      
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return {
        error: error.message
      };
    }
  }

  /**
   * Batch compress multiple images
   * @param {Array} imagePaths - Array of input image paths
   * @param {string} outputDir - Output directory
   * @param {Object} options - Compression options
   * @returns {Promise<Object>} - Batch compression results
   */
  async batchCompress(imagePaths, outputDir, options = {}) {
    const results = [];
    let totalOriginalSize = 0;
    let totalCompressedSize = 0;
    
    try {
      for (const imagePath of imagePaths) {
        const filename = path.basename(imagePath, path.extname(imagePath));
        const outputPath = path.join(outputDir, `${filename}-compressed.webp`);
        
        const result = await this.compressImage(imagePath, outputPath, options);
        results.push({
          input: imagePath,
          output: outputPath,
          ...result
        });
        
        if (result.success) {
          totalOriginalSize += result.originalSize;
          totalCompressedSize += result.compressedSize;
        }
      }
      
      const overallCompressionRatio = totalOriginalSize > 0 
        ? ((totalOriginalSize - totalCompressedSize) / totalOriginalSize * 100).toFixed(2)
        : 0;
      
      return {
        success: true,
        results,
        summary: {
          totalImages: imagePaths.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
          totalOriginalSize: `${(totalOriginalSize / (1024 * 1024)).toFixed(2)} MB`,
          totalCompressedSize: `${(totalCompressedSize / (1024 * 1024)).toFixed(2)} MB`,
          overallCompressionRatio: `${overallCompressionRatio}%`
        }
      };
      
    } catch (error) {
      console.error('Batch compression error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = ImageCompressor; 