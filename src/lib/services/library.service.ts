import type { Drink } from '../types/drink';
import { supabase } from '$lib/supabase';
import { browser } from '$app/environment';

export interface CanLibraryItem {
  id: string;
  name: string;
  series: string;
  volume_ml: number;
  count: number;
  totalSpent: number;
  averageRating: number;
  imageUrl?: string;
  lastPurchased: string;
  firstPurchased: string;
}

export interface CanImage {
  id: string;
  can_name: string;
  series: string;
  image_url: string;
  created_at: string;
  user_id: string;
}

// Fallback storage using localStorage
const STORAGE_KEY = 'monster_can_images';

function getLocalImages(): Record<string, string> {
  if (!browser) return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : {};
    console.log('📁 getLocalImages:', Object.keys(parsed).length, 'images stored locally');
    return parsed;
  } catch (error) {
    console.error('❌ Error reading localStorage:', error);
    return {};
  }
}

function setLocalImages(images: Record<string, string>) {
  if (!browser) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
    console.log('💾 setLocalImages: Saved', Object.keys(images).length, 'images to localStorage');
  } catch (error) {
    console.error('❌ Error saving to localStorage:', error);
  }
}

/**
 * Test if an image URL is accessible
 */
async function testImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

export class LibraryService {
  /**
   * Get all unique cans from drinks data with aggregated information
   */
  static async getCanLibrary(): Promise<CanLibraryItem[]> {
    console.log('🔍 LibraryService: Starting getCanLibrary...');
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('❌ LibraryService: User authentication failed:', userError);
      throw new Error('User must be authenticated');
    }

    console.log('✅ LibraryService: User authenticated:', user.id);

    // Get all drinks for the user
    const { data: drinks, error: drinksError } = await supabase
      .from('drinks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    console.log('📊 LibraryService: Drinks query result:', { 
      drinks: drinks?.length || 0, 
      error: drinksError,
      drinksData: drinks?.slice(0, 3) // Log first 3 drinks for debugging
    });

    if (drinksError) {
      console.error('❌ LibraryService: Drinks query error:', drinksError);
      throw new Error(drinksError.message);
    }

    if (!drinks || drinks.length === 0) {
      console.log('⚠️ LibraryService: No drinks found for user');
      console.log('📊 LibraryService: Full query response:', { data: drinks, error: drinksError });
      return [];
    }

    // Try to get can images from database, fallback to localStorage
    let imageMap = new Map<string, string>();
    
    console.log('🖼️ LibraryService: Loading can images...');
    
    try {
      const { data: canImages } = await supabase
        .from('can_images')
        .select('*')
        .eq('user_id', user.id);

      console.log('🖼️ LibraryService: Database images result:', { 
        count: canImages?.length || 0, 
        images: canImages?.map(img => `${img.can_name}_${img.series}: ${img.image_url}`) 
      });

      canImages?.forEach(img => {
        const key = `${img.can_name}_${img.series}`;
        imageMap.set(key, img.image_url);
        console.log(`🖼️ LibraryService: Mapped ${key} -> ${img.image_url}`);
      });
    } catch (dbError) {
      console.log('⚠️ LibraryService: Database table not available:', dbError);
    }

    // Always load localStorage images as backup/fallback
    console.log('🖼️ LibraryService: Loading localStorage images as backup...');
    const localImages = getLocalImages();
    console.log('🖼️ LibraryService: Local images:', localImages);
    Object.entries(localImages).forEach(([key, url]) => {
      if (!imageMap.has(key)) { // Only use local if not already in database
        imageMap.set(key, url);
        console.log(`🖼️ LibraryService: Mapped local ${key} -> ${url.substring(0, 50)}...`);
      }
    });

    console.log('🖼️ LibraryService: Final image map size:', imageMap.size);

    // Group drinks by name and series combination
    const canGroups = new Map<string, Drink[]>();
    
    console.log('🔄 LibraryService: Starting aggregation for', drinks.length, 'drinks');
    
    drinks.forEach(drink => {
      const key = `${drink.name}_${drink.series}`;
      if (!canGroups.has(key)) {
        canGroups.set(key, []);
      }
      canGroups.get(key)!.push(drink);
    });

    console.log('📦 LibraryService: Grouped into', canGroups.size, 'unique can types');

    // Transform groups into CanLibraryItem objects
    const libraryItems: CanLibraryItem[] = [];
    
    canGroups.forEach((groupDrinks, key) => {
      const firstDrink = groupDrinks[0];
      const count = groupDrinks.length;
      const totalSpent = groupDrinks.reduce((sum, drink) => sum + drink.cost, 0);
      const averageRating = groupDrinks.reduce((sum, drink) => sum + drink.rating, 0) / count;
      
      // Sort to get first and last purchased dates
      const sortedDrinks = groupDrinks.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      libraryItems.push({
        id: key,
        name: firstDrink.name,
        series: firstDrink.series,
        volume_ml: firstDrink.volume_ml,
        count,
        totalSpent,
        averageRating,
        imageUrl: imageMap.get(key),
        firstPurchased: sortedDrinks[0].created_at,
        lastPurchased: sortedDrinks[sortedDrinks.length - 1].created_at
      });
    });

    // Sort by count (most purchased first)
    const result = libraryItems.sort((a, b) => b.count - a.count);
    
    console.log('✅ LibraryService: Returning', result.length, 'library items');
    console.log('🖼️ LibraryService: Items with images:', result.filter(item => item.imageUrl).length);
    
    return result;
  }

  /**
   * Get all unique can names and series combinations from existing drinks
   */
  static async getExistingCanTypes(): Promise<Array<{ name: string; series: string }>> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('User must be authenticated');
    }

    const { data: drinks, error } = await supabase
      .from('drinks')
      .select('name, series')
      .eq('user_id', user.id);

    if (error) {
      throw new Error(error.message);
    }

    if (!drinks) return [];

    // Get unique combinations
    const uniqueCans = new Map<string, { name: string; series: string }>();
    drinks.forEach(drink => {
      const key = `${drink.name}_${drink.series}`;
      uniqueCans.set(key, { name: drink.name, series: drink.series });
    });

    return Array.from(uniqueCans.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Add or update a can image
   */
  static async addCanImage(canName: string, series: string, imageFile: File): Promise<string> {
    console.log('🖼️ addCanImage called with:', { canName, series, fileName: imageFile.name, fileSize: imageFile.size });
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('❌ User authentication failed:', userError);
      // If no user, use localStorage fallback immediately
      console.log('⚠️ No user authenticated, using localStorage fallback');
      return this.addCanImageLocal(canName, series, imageFile);
    }

    console.log('✅ User authenticated:', user.id);

    try {
      // Try to upload to Supabase storage first
      const fileName = `${user.id}/${canName}_${series}_${Date.now()}.${imageFile.name.split('.').pop()}`;
      console.log('📤 Attempting upload to storage with fileName:', fileName);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('can_images')
        .upload(fileName, imageFile);

      console.log('📤 Storage upload result:', { uploadData, uploadError });

      if (uploadError) {
        console.error('❌ Storage upload error:', uploadError);
        // Fallback to localStorage if storage fails
        console.log('⚠️ Storage failed, falling back to localStorage');
        return this.addCanImageLocal(canName, series, imageFile);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('can_images')
        .getPublicUrl(fileName);

      console.log('🔗 Generated public URL:', urlData);

      // Test if the URL is accessible
      const urlAccessible = await testImageUrl(urlData.publicUrl);
      console.log('🔗 URL accessibility test:', { url: urlData.publicUrl, accessible: urlAccessible });

      if (!urlAccessible) {
        console.log('⚠️ Generated URL not accessible, falling back to localStorage');
        return this.addCanImageLocal(canName, series, imageFile);
      }

      // Try to save to database
      try {
        console.log('💾 Attempting to save to database...');
        const { data, error } = await supabase
          .from('can_images')
          .upsert({
            can_name: canName,
            series: series,
            image_url: urlData.publicUrl,
            user_id: user.id
          }, {
            onConflict: 'can_name,series,user_id'
          })
          .select()
          .single();

        console.log('💾 Database save result:', { data, error });

        if (error) {
          console.error('❌ Database error:', error);
          // Still return the URL even if database save fails - localStorage will be updated below
        }
      } catch (dbError) {
        console.log('⚠️ Database table not available:', dbError);
      }

      // Always save to localStorage as backup
      const localImages = getLocalImages();
      localImages[`${canName}_${series}`] = urlData.publicUrl;
      setLocalImages(localImages);

      console.log('✅ Image upload completed successfully:', urlData.publicUrl);
      return urlData.publicUrl;

    } catch (error) {
      // Complete fallback: convert to base64 and store locally
      console.log('⚠️ Storage upload failed, using base64 fallback:', error);
      return this.addCanImageLocal(canName, series, imageFile);
    }
  }

  /**
   * Add can image using localStorage only (fallback method)
   */
  private static async addCanImageLocal(canName: string, series: string, imageFile: File): Promise<string> {
    console.log('💾 addCanImageLocal: Using localStorage fallback');
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const base64 = reader.result as string;
          const localImages = getLocalImages();
          localImages[`${canName}_${series}`] = base64;
          setLocalImages(localImages);
          console.log('✅ Base64 fallback completed successfully');
          resolve(base64);
        } catch (error) {
          console.error('❌ Error in base64 fallback:', error);
          reject(new Error('Failed to process image'));
        }
      };
      reader.onerror = () => {
        console.error('❌ FileReader error');
        reject(new Error('Failed to read image file'));
      };
      reader.readAsDataURL(imageFile);
    });
  }

  /**
   * Remove a can image
   */
  static async removeCanImage(canName: string, series: string): Promise<void> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('User must be authenticated');
    }

    try {
      // Try to remove from database
      const { error } = await supabase
        .from('can_images')
        .delete()
        .eq('can_name', canName)
        .eq('series', series)
        .eq('user_id', user.id);

      if (error) {
        throw new Error(error.message);
      }
    } catch (dbError) {
      // Fallback to localStorage
      console.log('Database table not available, using localStorage fallback');
    }
    
    // Always remove from localStorage as well
    const localImages = getLocalImages();
    delete localImages[`${canName}_${series}`];
    setLocalImages(localImages);
  }
} 