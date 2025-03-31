
import { supabase } from "@/integrations/supabase/client";

export async function POST(req: Request) {
  try {
    // Get user from Supabase session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const userId = sessionData.session.user.id;
    
    const formData = await req.json();
    
    // Store application in Supabase
    const { data: creatorApplication, error } = await supabase
      .from('creator_applications')
      .insert({
        user_id: userId,
        status: "pending",
        is_over_18: formData.isOver18,
        agrees_to_terms: formData.agreesToTerms,
        date_submitted: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Create related identity record
    const { error: identityError } = await supabase
      .from('identities')
      .insert({
        application_id: creatorApplication.id,
        full_name: formData.fullName,
        date_of_birth: new Date(formData.dateOfBirth).toISOString(),
        country_of_residence: formData.countryOfResidence,
        government_id_front_url: "url-placeholder",
        government_id_back_url: "url-placeholder",
        selfie_url: "url-placeholder",
      });
    
    if (identityError) throw identityError;
    
    // Create related tax info record
    const { error: taxInfoError } = await supabase
      .from('tax_infos')
      .insert({
        application_id: creatorApplication.id,
        is_us_citizen: formData.isUSCitizen === "yes",
        tax_country: formData.taxCountry,
        tax_id: formData.taxId,
        business_name: formData.businessName || null,
        tax_address: formData.taxAddress,
        tax_classification: formData.taxClassification,
      });
    
    if (taxInfoError) throw taxInfoError;
    
    // Create payment info record
    const { error: paymentInfoError } = await supabase
      .from('payment_infos')
      .insert({
        application_id: creatorApplication.id,
        stripe_connect_id: "placeholder-id",
        payout_currency: formData.payoutCurrency,
        payout_schedule: formData.payoutSchedule,
      });
    
    if (paymentInfoError) throw paymentInfoError;
    
    // Create creator profile record
    const { error: profileError } = await supabase
      .from('creator_profiles')
      .insert({
        application_id: creatorApplication.id,
        display_name: formData.displayName,
        profile_photo_url: "url-placeholder",
        bio: formData.bio,
        content_categories: formData.contentCategories,
      });
    
    if (profileError) throw profileError;
    
    // Create agreement record
    const { error: agreementError } = await supabase
      .from('agreements')
      .insert({
        application_id: creatorApplication.id,
        agrees_to_all_docs: formData.agreesToAllDocs,
        signature: formData.signature,
        signature_date: new Date().toISOString(),
      });
    
    if (agreementError) throw agreementError;
    
    return new Response(JSON.stringify({ success: true, id: creatorApplication.id }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error("Error creating creator application:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
