
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Mail, Lock, User, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const signupSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  username: z.string().min(3, { message: 'Username must be at least 3 characters' }),
  birthday: z.string().min(1, { message: 'Please enter your birthday' })
    .refine(date => {
      // Basic validation to check if it's a valid date format
      return !isNaN(Date.parse(date));
    }, {
      message: 'Please enter a valid date format (e.g., MM/DD/YYYY)',
    })
    .refine(date => new Date(date) <= new Date(), {
      message: 'Birthday cannot be in the future',
    }),
  location: z.string().min(2, { message: 'Please enter a valid location' }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

interface SignupFormProps {
  toggleForm: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ toggleForm }) => {
  const { signUp, loading } = useAuth();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      username: '',
      birthday: '',
      location: '',
    },
  });

  const onSubmit = async (values: SignupFormValues) => {
    const { email, password, username, birthday, location } = values;
    
    await signUp(email, password, {
      username,
      birthday,
      user_role: 'user',
      orientation: 'other', // default value
      location,
    });
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 h-4 w-4" />
                    <Input
                      placeholder="Enter your email"
                      className="pl-10 bg-abyss border-white/20 text-white"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 h-4 w-4" />
                    <Input
                      type="password"
                      placeholder="Choose a password"
                      className="pl-10 bg-abyss border-white/20 text-white"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Username</FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 h-4 w-4" />
                    <Input
                      placeholder="Choose a username"
                      className="pl-10 bg-abyss border-white/20 text-white"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="birthday"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Birthday</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="MM/DD/YYYY"
                      className="pl-10 bg-abyss border-white/20 text-white"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Location</FormLabel>
                <FormControl>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 h-4 w-4" />
                    <Input
                      placeholder="Your location"
                      className="pl-10 bg-abyss border-white/20 text-white"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-crimson hover:bg-crimson/90 text-white"
            disabled={loading}
          >
            Create Account <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </Form>

      <div className="mt-6 text-center">
        <button
          onClick={toggleForm}
          className="text-white/70 hover:text-white text-sm transition-colors"
        >
          Already have an account? Sign in
        </button>
      </div>
    </>
  );
};

export default SignupForm;
