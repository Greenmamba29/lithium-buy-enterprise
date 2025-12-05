import { useState } from 'react';
import { useSignUp } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link, useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';

export default function Signup() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const signUp = useSignUp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await signUp.mutateAsync({ email, password, companyName });
      setLocation('/');
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-serif">Create Account</CardTitle>
          <CardDescription>
            Sign up to start sourcing lithium suppliers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {signUp.isError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {signUp.error instanceof Error ? signUp.error.message : 'Failed to sign up'}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={signUp.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company Name (Optional)</Label>
              <Input
                id="company"
                type="text"
                placeholder="Your Company"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={signUp.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                disabled={signUp.isPending}
              />
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={signUp.isPending}
            >
              {signUp.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Sign Up'
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/login" className="text-gold hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



