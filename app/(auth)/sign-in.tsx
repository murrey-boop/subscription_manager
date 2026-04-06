import { useSignIn } from '@clerk/expo';
import { Link } from 'expo-router';
import { styled } from 'nativewind';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { usePostHog } from 'posthog-react-native';


const SafeAreaView = styled(RNSafeAreaView);

const  SignIn = () => {
    const { signIn, errors, fetchStatus } = useSignIn();
    const posthog = usePostHog();

    const [emailAddress, setEmailAddress] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');

// Validation states
const [emailTouched, setEmailTouched] = useState(false);
const [passwordTouched, setPasswordTouched] = useState(false);
const [signInError, setSignInError] = useState<string | null>(null);

// Client-side validation
const emailValid = emailAddress.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress);
const passwordValid = password.length > 0;
const formValid = emailAddress.length > 0 && password.length > 0 && emailValid;

const handleSubmit = async () => {
    if (!formValid) return;
    setSignInError(null);

    try {
        const { error } = await signIn.password({
            emailAddress,
            password,
        });

        if (error) {
            console.error('Password auth error:', JSON.stringify(error, null, 2));
            setSignInError(error.message || 'Authentication failed');
            return;
        }

        console.log('Password auth succeeded. Status:', signIn.status);

        if (signIn.status === 'complete') {
            posthog.identify(emailAddress, {
                $set: { email: emailAddress },
                $set_once: { first_sign_in_date: new Date().toISOString() },
            });
            posthog.capture('user_signed_in', { method: 'password' });
            await signIn.finalize({
                navigate: ({ session }) => {
                    if (session?.currentTask) {
                        console.log(session?.currentTask);
                        return;
                    }
                },
            });
        } else if (signIn.status === 'needs_second_factor') {
            console.log('MFA required');
            const emailCodeFactor = signIn.supportedSecondFactors.find(
                (factor) => factor.strategy === 'email_code'
            );

            if (emailCodeFactor) {
                console.log('Sending MFA email code...');
                await signIn.mfa.sendEmailCode();
            } else {
                setSignInError('No MFA email verification method available');
            }
        } else if (signIn.status === 'needs_client_trust') {
            console.log('Client trust verification needed');
            const emailCodeFactor = signIn.supportedSecondFactors.find(
                (factor) => factor.strategy === 'email_code'
            );

            if (emailCodeFactor) {
                console.log('Sending MFA email code...');
                await signIn.mfa.sendEmailCode();
            } else {
                setSignInError('No email verification method available');
            }
        } else {
            setSignInError('Unexpected sign-in state');
            console.error('Unexpected status:', signIn.status);
        }
    } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred';
        console.error('Sign-in error:', errorMsg);
        setSignInError(errorMsg);
        posthog.capture('$exception', {
            $exception_list: [{ type: 'SignInError', value: errorMsg }],
            $exception_source: 'sign-in',
        });
    }
};

const handleVerify = async () => {
    setSignInError(null);

    try {
        console.log('Verifying MFA code...');
        const result = await signIn.mfa.verifyEmailCode({ code });
        console.log('MFA verification result:', result);
        console.log('Sign-in status after verification:', signIn.status);

        if (signIn.status === 'complete') {
            posthog.identify(emailAddress, {
                $set: { email: emailAddress },
            });
            posthog.capture('user_signed_in', { method: 'mfa' });
            await signIn.finalize({
                navigate: ({ session }) => {
                    if (session?.currentTask) {
                        console.log(session?.currentTask);
                        return;
                    }
                },
            });
        } else {
            setSignInError('Verification incomplete. Please try again.');
            console.log('Verification incomplete. Status:', signIn.status);
        }
    } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Verification failed';
        console.error('MFA verification error:', errorMsg);
        setSignInError(errorMsg);
    }
};

// Show verification screen if Clerk requires second-factor verification
if (signIn.status === 'needs_second_factor' || signIn.status === 'needs_client_trust') {
    return (
        <SafeAreaView className="auth-safe-area">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="auth-screen"
            >
                <ScrollView
                    className="auth-scroll"
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View className="auth-content">
                        {/* Branding */}
                        <View className="auth-brand-block">
                            <View className="auth-logo-wrap">
                                <View className="auth-logo-mark">
                                    <Text className="auth-logo-mark-text">R</Text>
                                </View>
                                <View>
                                    <Text className="auth-wordmark">Recurrly</Text>
                                    <Text className="auth-wordmark-sub">SUBSCRIPTIONS</Text>
                                </View>
                            </View>
                            <Text className="auth-title">Verify your identity</Text>
                            <Text className="auth-subtitle">
                                We sent a verification code to your email
                            </Text>
                        </View>

                        {/* Verification Form */}
                        {signInError && (
                            <View className="mb-4 rounded-2xl border border-destructive bg-destructive/10 p-3">
                                <Text className="text-sm font-sans-medium text-destructive">{signInError}</Text>
                            </View>
                        )}
                        <View className="auth-card">
                            <View className="auth-form">
                                <View className="auth-field">
                                    <Text className="auth-label">Verification Code</Text>
                                    <TextInput
                                        className="auth-input"
                                        style={{ fontFamily: 'sans-medium' }}
                                        value={code}
                                        placeholder="Enter 6-digit code"
                                        placeholderTextColor="rgba(0, 0, 0, 0.4)"
                                        onChangeText={setCode}
                                        keyboardType="number-pad"
                                        autoComplete="one-time-code"
                                        maxLength={6}
                                    />
                                    {errors.fields.code && (
                                        <Text className="auth-error">{errors.fields.code.message}</Text>
                                    )}
                                </View>

                                <Pressable
                                    className={`auth-button ${(!code || fetchStatus === 'fetching') && 'auth-button-disabled'}`}
                                    onPress={handleVerify}
                                    disabled={!code || fetchStatus === 'fetching'}
                                >
                                    <Text className="auth-button-text">
                                        {fetchStatus === 'fetching' ? 'Verifying...' : 'Verify'}
                                    </Text>
                                </Pressable>

                                <Pressable
                                    className="auth-secondary-button"
                                    onPress={() => signIn.mfa.sendEmailCode()}
                                    disabled={fetchStatus === 'fetching'}
                                >
                                    <Text className="auth-secondary-button-text">Resend Code</Text>
                                </Pressable>

                                <Pressable
                                    className="auth-secondary-button"
                                    onPress={() => signIn.reset()}
                                    disabled={fetchStatus === 'fetching'}
                                >
                                    <Text className="auth-secondary-button-text">Start Over</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// Main sign-in form
return (
    <SafeAreaView className="auth-safe-area">
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="auth-screen"
        >
            <ScrollView
                className="auth-scroll"
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View className="auth-content">
                    {/* Branding */}
                    <View className="auth-brand-block">
                        <View className="auth-logo-wrap">
                            <View className="auth-logo-mark">
                                <Text className="auth-logo-mark-text">R</Text>
                            </View>
                            <View>
                                <Text className="auth-wordmark">Recurrly</Text>
                                <Text className="auth-wordmark-sub">SUBSCRIPTIONS</Text>
                            </View>
                        </View>
                        <Text className="auth-title">Welcome back</Text>
                        <Text className="auth-subtitle">
                            Sign in to continue managing your subscriptions
                        </Text>
                    </View>

                    {/* Sign-In Form */}
                    {signInError && (
                        <View className="mb-4 rounded-2xl border border-destructive bg-destructive/10 p-3">
                            <Text className="text-sm font-sans-medium text-destructive">{signInError}</Text>
                        </View>
                    )}
                    <View className="auth-card">
                        <View className="auth-form">
                            <View className="auth-field">
                                <Text className="auth-label">Email Address</Text>
                                <TextInput
                                    className={`auth-input ${emailTouched && !emailValid && 'auth-input-error'}`}
                                    style={{ fontFamily: 'sans-medium' }}
                                    autoCapitalize="none"
                                    value={emailAddress}
                                    placeholder="name@example.com"
                                    placeholderTextColor="rgba(0, 0, 0, 0.4)"
                                    onChangeText={setEmailAddress}
                                    onBlur={() => setEmailTouched(true)}
                                    keyboardType="email-address"
                                    autoComplete="email"
                                />
                                {emailTouched && !emailValid && (
                                    <Text className="auth-error">Please enter a valid email address</Text>
                                )}
                                {errors.fields.identifier && (
                                    <Text className="auth-error">{errors.fields.identifier.message}</Text>
                                )}
                            </View>

                            <View className="auth-field">
                                <Text className="auth-label">Password</Text>
                                <TextInput
                                    className={`auth-input ${passwordTouched && !passwordValid && 'auth-input-error'}`}
                                    style={{ fontFamily: 'sans-medium' }}
                                    value={password}
                                    placeholder="Enter your password"
                                    placeholderTextColor="rgba(0, 0, 0, 0.4)"
                                    secureTextEntry
                                    onChangeText={setPassword}
                                    onBlur={() => setPasswordTouched(true)}
                                    autoComplete="password"
                                />
                                {passwordTouched && !passwordValid && (
                                    <Text className="auth-error">Password is required</Text>
                                )}
                                {errors.fields.password && (
                                    <Text className="auth-error">{errors.fields.password.message}</Text>
                                )}
                            </View>

                            <Pressable
                                className={`auth-button ${(!formValid || fetchStatus === 'fetching') && 'auth-button-disabled'}`}
                                onPress={handleSubmit}
                                disabled={!formValid || fetchStatus === 'fetching'}
                            >
                                <Text className="auth-button-text">
                                    {fetchStatus === 'fetching' ? 'Signing In...' : 'Sign In'}
                                </Text>
                            </Pressable>
                        </View>
                    </View>

                    {/* Sign-Up Link */}
                    <View className="auth-link-row">
                        <Text className="auth-link-copy">Don&apos;t have an account?</Text>
                        <Link href="/(auth)/sign-up" asChild>
                            <Pressable>
                                <Text className="auth-link">Create Account</Text>
                            </Pressable>
                        </Link>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    </SafeAreaView>
);
};

export default SignIn;
