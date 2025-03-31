import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { submitCreatorApplication } from '@/api/creator-application';
import { FileUploader } from '@/components/ui/file-uploader';

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

interface StepProps {
  formData: FormData;
  handleChange: (field: string, value: any) => void;
}

interface FileUploadStepProps extends StepProps {
  handleFileUpload: (field: string, files: FileList) => void;
}

const CreatorApplication: React.FC = () => {
  const [currentStep, setCurrentStep] = React.useState<number>(1);
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState<FormData>({
    // Step 1
    isOver18: false,
    agreesToTerms: false,
    
    // Step 2
    fullName: '',
    dateOfBirth: '',
    countryOfResidence: '',
    governmentIdFront: null,
    governmentIdBack: null,
    selfie: null,
    
    // Step 3
    isUSCitizen: null,
    taxCountry: '',
    taxId: '',
    businessName: '',
    taxAddress: '',
    taxClassification: '',
    
    // Step 4
    payoutCurrency: 'USD',
    payoutSchedule: 'monthly',
    stripeConnected: false,
    
    // Step 5
    displayName: '',
    profilePhoto: null,
    bio: '',
    contentCategories: [],
    
    // Step 6
    agreesToAllDocs: false,
    signature: '',
    dateSubmitted: ''
  });

  const handleChange = (field: string, value: any): void => {
    setFormData({ ...formData, [field]: value });
  };

  const handleFileUpload = (field: string, files: FileList): void => {
    if (files && files.length > 0) {
      setFormData({ ...formData, [field]: files[0] });
    }
  };

  const handleNext = () => {
    // Validate current step
    if (currentStep === 1) {
      if (!formData.isOver18 || !formData.agreesToTerms) {
        toast.error('You must confirm both checkboxes to continue');
        return;
      }
    }
    
    if (currentStep === 2) {
      if (!formData.fullName || !formData.dateOfBirth || !formData.countryOfResidence) {
        toast.error('Please complete all required identity fields');
        return;
      }
    }
    
    // Add validation for other steps as needed
    
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    // Ensure user is authenticated
    if (!user) {
      toast.error('You must be logged in to submit an application');
      return;
    }
    
    // Final validation
    if (!formData.agreesToAllDocs || !formData.signature) {
      toast.error('Please agree to all documents and provide your signature');
      return;
    }

    // Set submission date
    const updatedFormData = {
      ...formData,
      dateSubmitted: format(new Date(), 'yyyy-MM-dd')
    };

    try {
      setIsSubmitting(true);
      const result = await submitCreatorApplication(updatedFormData);
      
      if (result.success) {
        toast.success('Your creator application has been submitted!');
      } else {
        throw new Error(result.error?.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeStep formData={formData} handleChange={handleChange} />;
      case 2:
        return <IdentityVerificationStep formData={formData} handleChange={handleChange} handleFileUpload={handleFileUpload} />;
      case 3:
        return <TaxInfoStep formData={formData} handleChange={handleChange} />;
      case 4:
        return <PaymentSetupStep formData={formData} handleChange={handleChange} />;
      case 5:
        return <ProfileSetupStep formData={formData} handleChange={handleChange} handleFileUpload={handleFileUpload} />;
      case 6:
        return <AgreementsStep formData={formData} handleChange={handleChange} />;
      default:
        return null;
    }
  };

  return (
    <div className="py-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Creator Application</h1>
        <div className="text-sm text-muted-foreground">
          Step {currentStep} of 6
        </div>
      </div>
      
      <Card className="bg-black/20 border-white/10">
        {renderStep()}
        
        <CardFooter className="flex justify-between pt-6">
          {currentStep > 1 && (
            <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
              Back
            </Button>
          )}
          {currentStep < 6 ? (
            <Button onClick={handleNext} disabled={isSubmitting}>Continue</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="mr-2 animate-spin">⟳</span>
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

// Step 1: Welcome / Eligibility
const WelcomeStep: React.FC<StepProps> = ({ formData, handleChange }) => {
  return (
    <>
      <CardHeader>
        <CardTitle className="text-2xl">Become a Creator on SubSpace</CardTitle>
        <CardDescription>
          Monetize your content, connect with fans, and own your domain — all while staying secure and independent.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">As a SubSpace Creator, you can:</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Publish exclusive content for your subscribers</li>
            <li>Set your own subscription pricing and tiers</li>
            <li>Build a community around your content</li>
            <li>Receive direct payments with low platform fees</li>
            <li>Maintain ownership of your content and brand</li>
          </ul>
        </div>
        
        <div className="space-y-4 pt-4">
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="over18" 
              checked={formData.isOver18}
              onCheckedChange={(checked) => handleChange("isOver18", checked)}
            />
            <Label 
              htmlFor="over18" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I am 18 years of age or older
            </Label>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="agreeTerms" 
              checked={formData.agreesToTerms}
              onCheckedChange={(checked) => handleChange("agreesToTerms", checked)}
            />
            <Label 
              htmlFor="agreeTerms" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree to the SubSpace Creator Terms & Independent Contractor Agreement
            </Label>
          </div>
        </div>
      </CardContent>
    </>
  );
};

// Step 2: Identity Verification
const IdentityVerificationStep: React.FC<FileUploadStepProps> = ({ formData, handleChange, handleFileUpload }) => {
  return (
    <>
      <CardHeader>
        <CardTitle className="text-2xl">Verify Your Identity</CardTitle>
        <CardDescription>
          Required for legal compliance and secure payouts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Legal Name</Label>
            <Input 
              id="fullName" 
              value={formData.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              placeholder="Enter your full legal name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input 
              id="dateOfBirth" 
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleChange("dateOfBirth", e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="countryOfResidence">Country of Residence</Label>
            <Select 
              value={formData.countryOfResidence}
              onValueChange={(value) => handleChange("countryOfResidence", value)}
            >
              <SelectTrigger id="countryOfResidence">
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="us">United States</SelectItem>
                <SelectItem value="ca">Canada</SelectItem>
                <SelectItem value="uk">United Kingdom</SelectItem>
                {/* Add more countries as needed */}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2 pt-4">
            <Label htmlFor="governmentIdFront">Upload Government ID (Front)</Label>
            <FileUploader
              accept="image/jpeg,image/png,application/pdf"
              onFilesSelected={(files) => files && handleFileUpload("governmentIdFront", files)}
            />
            {formData.governmentIdFront && (
              <p className="text-sm text-green-600">Uploaded: {formData.governmentIdFront.name}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="governmentIdBack">Upload Government ID (Back)</Label>
            <FileUploader
              accept="image/jpeg,image/png,application/pdf"
              onFilesSelected={(files) => files && handleFileUpload("governmentIdBack", files)}
            />
            {formData.governmentIdBack && (
              <p className="text-sm text-green-600">Uploaded: {formData.governmentIdBack.name}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="selfie">Upload Selfie</Label>
            <FileUploader
              accept="image/jpeg,image/png"
              onFilesSelected={(files) => files && handleFileUpload("selfie", files)}
            />
            {formData.selfie && (
              <p className="text-sm text-green-600">Uploaded: {formData.selfie.name}</p>
            )}
          </div>
        </div>
      </CardContent>
    </>
  );
};

// Step 3: Tax & Legal Info
const TaxInfoStep: React.FC<StepProps> = ({ formData, handleChange }) => {
  return (
    <>
      <CardHeader>
        <CardTitle className="text-2xl">Tax Information</CardTitle>
        <CardDescription>
          Used to report your earnings to tax authorities.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Are you a U.S. Citizen or Resident?</Label>
            <RadioGroup
              value={formData.isUSCitizen}
              onValueChange={(value) => handleChange("isUSCitizen", value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="us-yes" />
                <Label htmlFor="us-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="us-no" />
                <Label htmlFor="us-no">No</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="taxCountry">Country of Tax Residence</Label>
            <Select 
              value={formData.taxCountry}
              onValueChange={(value) => handleChange("taxCountry", value)}
            >
              <SelectTrigger id="taxCountry">
                <SelectValue placeholder="Select your tax country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="us">United States</SelectItem>
                <SelectItem value="ca">Canada</SelectItem>
                <SelectItem value="uk">United Kingdom</SelectItem>
                {/* Add more countries as needed */}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="taxId">
              {formData.isUSCitizen === "yes" ? "SSN / EIN" : "Tax Identification Number"}
            </Label>
            <Input 
              id="taxId" 
              type="password"
              value={formData.taxId}
              onChange={(e) => handleChange("taxId", e.target.value)}
              placeholder="Enter your tax ID"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name (if applicable)</Label>
            <Input 
              id="businessName" 
              value={formData.businessName}
              onChange={(e) => handleChange("businessName", e.target.value)}
              placeholder="Business name (optional)"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="taxAddress">Address (for tax forms)</Label>
            <Textarea 
              id="taxAddress" 
              value={formData.taxAddress}
              onChange={(e) => handleChange("taxAddress", e.target.value)}
              placeholder="Enter your full tax address"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="taxClassification">Tax classification</Label>
            <Select 
              value={formData.taxClassification}
              onValueChange={(value) => handleChange("taxClassification", value)}
            >
              <SelectTrigger id="taxClassification">
                <SelectValue placeholder="Select your tax classification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual/Sole Proprietor</SelectItem>
                <SelectItem value="llc">Limited Liability Company</SelectItem>
                <SelectItem value="corp">Corporation</SelectItem>
                <SelectItem value="partnership">Partnership</SelectItem>
                <SelectItem value="trust">Trust/Estate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </>
  );
};

// Step 4: Payment Setup
const PaymentSetupStep: React.FC<StepProps> = ({ formData, handleChange }) => {
  const connectStripe = async () => {
    try {
      // In a real implementation, this would redirect to Stripe Connect
      // For demo, just mark as connected
      handleChange("stripeConnected", true);
      toast.success("Successfully connected with Stripe!");
    } catch (error) {
      toast.error("Failed to connect with Stripe. Please try again.");
      console.error(error);
    }
  };
  
  return (
    <>
      <CardHeader>
        <CardTitle className="text-2xl">Set Up Your Payouts</CardTitle>
        <CardDescription>
          Configure how you'll receive your earnings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="p-6 border rounded-lg bg-muted/50 text-center">
            <h3 className="text-lg font-medium mb-2">Connect with Stripe</h3>
            <p className="text-sm text-muted-foreground mb-4">
              SubSpace uses Stripe to securely process payments and manage your payouts.
            </p>
            
            {formData.stripeConnected ? (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <span>Successfully connected with Stripe</span>
              </div>
            ) : (
              <Button onClick={connectStripe} className="bg-[#635BFF] hover:bg-[#4b44c9]">
                Connect with Stripe
              </Button>
            )}
          </div>
          
          <div className="space-y-2 pt-4">
            <Label htmlFor="payoutCurrency">Preferred payout currency</Label>
            <Select 
              value={formData.payoutCurrency}
              onValueChange={(value) => handleChange("payoutCurrency", value)}
            >
              <SelectTrigger id="payoutCurrency">
                <SelectValue placeholder="Select your currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="GBP">GBP - British Pound</SelectItem>
                <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                {/* Add more currencies as needed */}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="payoutSchedule">Payout schedule</Label>
            <Select 
              value={formData.payoutSchedule}
              onValueChange={(value) => handleChange("payoutSchedule", value)}
            >
              <SelectTrigger id="payoutSchedule">
                <SelectValue placeholder="Select your payout schedule" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </>
  );
};

// Step 5: Creator Profile Setup
const ProfileSetupStep: React.FC<FileUploadStepProps> = ({ formData, handleChange, handleFileUpload }) => {
  return (
    <>
      <CardHeader>
        <CardTitle className="text-2xl">Customize Your Public Profile</CardTitle>
        <CardDescription>
          Set up your creator profile that fans will see.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <div className="flex">
              <Input 
                id="displayName" 
                value={formData.displayName}
                onChange={(e) => handleChange("displayName", e.target.value)}
                placeholder="Your creator name"
                required
              />
              <div className="flex items-center bg-muted px-3 text-muted-foreground rounded-r-md border border-l-0">
                .SubSpace.media
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              This will become your URL, e.g., "{formData.displayName || 'MasterDom'}.SubSpace.media"
            </p>
          </div>
          
          <div className="space-y-2 pt-2">
            <Label htmlFor="profilePhoto">Profile Photo</Label>
            <FileUploader
              accept="image/jpeg,image/png"
              onFilesSelected={(files) => files && handleFileUpload("profilePhoto", files)}
            />
            {formData.profilePhoto && (
              <p className="text-sm text-green-600">Uploaded: {formData.profilePhoto.name}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio">Bio / About You</Label>
            <Textarea 
              id="bio" 
              value={formData.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
              placeholder="Tell your fans about yourself and what content you create"
              className="min-h-[150px]"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Choose Content Categories</Label>
            <div className="grid grid-cols-2 gap-2">
              {["Art", "Music", "Writing", "Photography", "Video", "Education", "Gaming", "Tech", "Fitness", "Cooking"].map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`category-${category}`} 
                    checked={formData.contentCategories.includes(category)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleChange("contentCategories", [...formData.contentCategories, category]);
                      } else {
                        handleChange("contentCategories", formData.contentCategories.filter(c => c !== category));
                      }
                    }}
                  />
                  <Label htmlFor={`category-${category}`}>{category}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </>
  );
};

// Step 6: Agreements & E-Signature
const AgreementsStep: React.FC<StepProps> = ({ formData, handleChange }) => {
  const openDocument = (docName: string) => {
    toast(`Opening ${docName} document...`);
    // In a real app, this would open a modal with the document
  };
  
  return (
    <>
      <CardHeader>
        <CardTitle className="text-2xl">Final Step: Sign & Confirm</CardTitle>
        <CardDescription>
          Review and sign the creator agreements to complete your application.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold">Required Documents:</h3>
            
            <div className="space-y-2">
              {[
                "Independent Contractor Agreement",
                "Terms of Service",
                "Acceptable Use Policy",
                "Privacy Policy",
                "DMCA & Content Ownership Acknowledgment"
              ].map((doc) => (
                <div key={doc} className="flex items-center justify-between">
                  <span>{doc}</span>
                  <Button variant="ghost" size="sm" onClick={() => openDocument(doc)}>
                    View
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-4 space-y-4">
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="agreeAllDocs" 
                checked={formData.agreesToAllDocs}
                onCheckedChange={(checked) => handleChange("agreesToAllDocs", checked)}
              />
              <Label 
                htmlFor="agreeAllDocs" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I have read and agree to all above documents
              </Label>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="signature">Type full legal name to e-sign</Label>
              <Input 
                id="signature" 
                value={formData.signature}
                onChange={(e) => handleChange("signature", e.target.value)}
                placeholder="Enter your full legal name as signature"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>Date</Label>
              <Input 
                type="text"
                value={format(new Date(), "MMMM dd, yyyy")}
                disabled
              />
            </div>
          </div>
        </div>
      </CardContent>
    </>
  );
};

export default CreatorApplication;
