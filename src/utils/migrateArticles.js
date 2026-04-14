import { supabase } from '@/lib/customSupabaseClient';

/**
 * Migrates data from alteration_services and alteration_prices into the new unified articles table.
 * Handles duplicates by checking existing names and types.
 */
export const runArticleMigration = async () => {
  let migratedCount = 0;
  let skippedCount = 0;
  const errors = [];

  try {
    // 1. Fetch source and destination data
    const [
      { data: services, error: errServ },
      { data: prices, error: errPrices },
      { data: existingArticles, error: errArts }
    ] = await Promise.all([
      supabase.from('alteration_services').select('*'),
      supabase.from('alteration_prices').select('*'),
      supabase.from('articles').select('*')
    ]);

    if (errServ) throw new Error(`Failed to fetch services: ${errServ.message}`);
    if (errPrices) throw new Error(`Failed to fetch prices: ${errPrices.message}`);
    if (errArts) throw new Error(`Failed to fetch existing articles: ${errArts.message}`);

    const inserts = [];

    // Helper to check for duplicates in the destination table
    const isDuplicate = (name, type) => {
      return existingArticles?.some(
        (article) => article.name.toLowerCase() === name.toLowerCase() && article.type === type
      );
    };

    // 2. Process alteration_services -> Ajustement
    if (services && services.length > 0) {
      for (const service of services) {
        if (!isDuplicate(service.name, 'Ajustement')) {
          inserts.push({
            name: service.name,
            price: service.price,
            type: 'Ajustement',
            category_id: service.category_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        } else {
          skippedCount++;
        }
      }
    }

    // 3. Process alteration_prices -> Retouche
    if (prices && prices.length > 0) {
      for (const price of prices) {
        if (!isDuplicate(price.service, 'Retouche')) {
          inserts.push({
            name: price.service,
            price: price.price,
            type: 'Retouche',
            category_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        } else {
          skippedCount++;
        }
      }
    }

    // 4. Execute inserts in batches if there are any new items
    if (inserts.length > 0) {
      const { error: insertErr } = await supabase.from('articles').insert(inserts);
      
      if (insertErr) {
        errors.push(insertErr.message);
        throw new Error(`Failed to insert articles: ${insertErr.message}`);
      }
      
      migratedCount = inserts.length;
    }

    return { 
      success: true, 
      migratedCount, 
      skippedCount,
      errors,
      message: migratedCount > 0 
        ? `${migratedCount} articles ont été migrés.` 
        : `Aucun nouvel article à migrer.`
    };

  } catch (error) {
    console.error("Migration error:", error);
    return { 
      success: false, 
      error: error.message || "Une erreur inconnue s'est produite lors de la migration.",
      migratedCount: 0,
      skippedCount: 0,
      errors: [error.message]
    };
  }
};