
import { supabase } from '@/integrations/supabase/client';

interface FileUploadUrls {
  governmentIdFrontUrl: string;
  governmentIdBackUrl: string;
  selfieUrl: string;
  profilePhotoUrl: string;
}

interface FormData {
  isOver18: boolean;
  agreesToTerms: boolean;
  fullName: string;
  dateOfBirth: string;
  countryOfResidence: string;
  governmentIdFront: File | null;
  governmentIdBack: File | null;
  selfie: File | null;
  isUSCitizen: string | null;
  taxCountry: string;
  taxId: string;
  businessName: string;
  taxAddress: string;
  taxClassification: string;
  payoutCurrency: string;
  payoutSchedule: string;
  stripeConnected: boolean;
  displayName: string;
  profilePhoto: File | null;
  bio: string;
  contentCategories: string[];
  agreesToAllDocs: boolean;
  signature: string;
  dateSubmitted: string;
}

interface CreatorApplicationResult {
  success: boolean;
  application?: any;
  error?: any;
}

export async function submitCreatorApplication(formData: FormData): Promise<CreatorApplicationResult> {
  try {
    // Get the current user's ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Upload files to storage
    const fileUploads = await uploadFiles(formData, user.id);
    
    // Create the main application record
    const { data: application, error: applicationError } = await supabase
      .from('creator_applications')
      .insert({
        user_id: user.id,
        status: 'pending',
        is_over_18: formData.isOver18,
        agrees_to_terms: formData.agreesToTerms,
        date_submitted: new Date(formData.dateSubmitted).toISOString(),
      })
      .select()
      .single();
    
    if (applicationError) throw applicationError;
    
    // Create identity record
    const { error: identityError } = await supabase
      .from('identities')
      .insert({
        application_id: application.id,
        full_name: formData.fullName,
        date_of_birth: new Date(formData.dateOfBirth).toISOString(),
        country_of_residence: formData.countryOfResidence,
        government_id_front_url: fileUploads.governmentIdFrontUrl,
        government_id_back_url: fileUploads.governmentIdBackUrl,
        selfie_url: fileUploads.selfieUrl,
      });
    
    if (identityError) throw identityError;
    
    // Create tax info record
    const { error: taxInfoError } = await supabase
      .from('tax_infos')
      .insert({
        application_id: application.id,
        is_us_citizen: formData.isUSCitizen === 'yes',
        tax_country: formData.taxCountry,
        tax_id: formData.taxId, // Note: In production, encrypt sensitive data
        business_name: formData.businessName || null,
        tax_address: formData.taxAddress,
        tax_classification: formData.taxClassification,
      });
    
    if (taxInfoError) throw taxInfoError;
    
    // Create payment info record
    const { error: paymentInfoError } = await supabase
      .from('payment_infos')
      .insert({
        application_id: application.id,
        stripe_connect_id: formData.stripeConnected ? 'connected' : 'not-connected',
        payout_currency: formData.payoutCurrency,
        payout_schedule: formData.payoutSchedule,
      });
    
    if (paymentInfoError) throw paymentInfoError;
    
    // Create creator profile record
    const { error: profileError } = await supabase
      .from('creator_profiles')
      .insert({
        application_id: application.id,
        display_name: formData.displayName,
        profile_photo_url: fileUploads.profilePhotoUrl,
        bio: formData.bio,
        content_categories: formData.contentCategories,
      });
    
    if (profileError) throw profileError;
    
    // Create agreement record
    const { error: agreementError } = await supabase
      .from('agreements')
      .insert({
        application_id: application.id,
        agrees_to_all_docs: formData.agreesToAllDocs,
        signature: formData.signature,
        signature_date: new Date().toISOString(),
      });
    
    if (agreementError) throw agreementError;
    
    return { success: true, application };
  } catch (error) {
    console.error('Error submitting creator application:', error);
    return { success: false, error };
  }
}

async function uploadFiles(formData: FormData, userId: string): Promise<FileUploadUrls> {
  const urls: FileUploadUrls = {
    governmentIdFrontUrl: '',
    governmentIdBackUrl: '',
    selfieUrl: '',
    profilePhotoUrl: '',
  };
  
  try {
    // Upload government ID front
    if (formData.governmentIdFront) {
      const { data: frontData, error: frontError } = await supabase.storage
        .from('creator-verification')
        .upload(
          `${userId}/government-ids/front-${Date.now()}`,
          formData.governmentIdFront
        );
      
      if (frontError) throw frontError;
      
      // Get the public URL
      const { data: frontUrlData } = supabase.storage
        .from('creator-verification')
        .getPublicUrl(frontData.path);
      
      urls.governmentIdFrontUrl = frontUrlData.publicUrl;
    }
    
    // Upload government ID back
    if (formData.governmentIdBack) {
      const { data: backData, error: backError } = await supabase.storage
        .from('creator-verification')
        .upload(
          `${userId}/government-ids/back-${Date.now()}`,
          formData.governmentIdBack
        );
      
      if (backError) throw backError;
      
      // Get the public URL
      const { data: backUrlData } = supabase.storage
        .from('creator-verification')
        .getPublicUrl(backData.path);
      
      urls.governmentIdBackUrl = backUrlData.publicUrl;
    }
    
    // Upload selfie
    if (formData.selfie) {
      const { data: selfieData, error: selfieError } = await supabase.storage
        .from('creator-verification')
        .upload(
          `${userId}/selfies/selfie-${Date.now()}`,
          formData.selfie
        );
      
      if (selfieError) throw selfieError;
      
      // Get the public URL
      const { data: selfieUrlData } = supabase.storage
        .from('creator-verification')
        .getPublicUrl(selfieData.path);
      
      urls.selfieUrl = selfieUrlData.publicUrl;
    }
    
    // Upload profile photo
    if (formData.profilePhoto) {
      const { data: photoData, error: photoError } = await supabase.storage
        .from('creator-profiles')
        .upload(
          `${userId}/profile-${Date.now()}`,
          formData.profilePhoto
        );
      
      if (photoError) throw photoError;
      
      // Get the public URL
      const { data: photoUrlData } = supabase.storage
        .from('creator-profiles')
        .getPublicUrl(photoData.path);
      
      urls.profilePhotoUrl = photoUrlData.publicUrl;
    }
    
    return urls;
  } catch (error) {
    console.error('Error uploading files:', error);
    throw error;
  }
}
