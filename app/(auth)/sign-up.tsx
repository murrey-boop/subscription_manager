import { useAuth, useSignUp } from "@clerk/expo";
import { Link, useRouter, type Href } from "expo-router";
import { styled } from "nativewind";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const SignUp = () => {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [signUpError, setSignUpError] = useState<string | null>(null);

  const emailValid =
    emailAddress.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress);
  const passwordValid = password.length === 0 || password.length >= 8;
  const formValid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    emailAddress.length > 0 &&
    password.length >= 8 &&
    emailValid;

  const handleSubmit = async () => {
    if (!formValid) return;
    setSignUpError(null);

    try {
      const { error: createError } = await signUp.create({
        emailAddress,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      if (createError) {
        console.error('Sign-up creation error:', JSON.stringify(createError, null, 2));
        setSignUpError(createError.message || 'Failed to create account');
        return;
      }

      const { error: passwordError } = await signUp.password({
        emailAddress,
        password,
      });

      if (passwordError) {
        console.error('Password creation error:', JSON.stringify(passwordError, null, 2));
        setSignUpError(passwordError.message || 'Failed to set password');
        return;
      }

      console.log('Password created. Current status:', signUp.status);

      if (signUp.status === 'missing_requirements') {
        console.log('Sending email code...');
        const sendCodeResult = await signUp.verifications.sendEmailCode();
        console.log('Email code sent:', sendCodeResult);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred';
      console.error('Sign-up error:', errorMsg);
      setSignUpError(errorMsg);
    }
  };

  const handleVerify = async () => {
    setSignUpError(null);

    try {
      console.log('Verifying email code...');
      const verifyResult = await signUp.verifications.verifyEmailCode({
        code,
      });
      console.log('Email verification result:', verifyResult);
      console.log('Sign-up status after verification:', signUp.status);
      console.log('Unverified fields:', signUp.unverifiedFields);
      console.log('Missing fields:', signUp.missingFields);

      // Finalize the sign-up
      console.log('Finalizing sign-up...');
      await signUp.finalize({
        navigate: ({ session, decorateUrl }) => {
          console.log('Finalize navigate callback - session:', session);
          if (session?.currentTask) {
            console.log('Session has currentTask:', session.currentTask);
            return;
          }

          const destination = "/(tabs)" as Href;
          console.log('Navigating to:', destination);
          router.replace(destination);
        },
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Sign-up completion failed';
      console.error('Sign-up completion error:', errorMsg);
      setSignUpError(errorMsg);
    }
  };

  if (signUp.status === "complete" || isSignedIn) {
    return null;
  }

  if (
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address")
  ) {
    return (
      <SafeAreaView className="auth-safe-area">
        <KeyboardAvoidingView
          className="auth-screen"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            className="auth-scroll"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="auth-content">
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
                <Text className="auth-title">Verify your email</Text>
                <Text className="auth-subtitle">
                  We sent a verification code to {emailAddress}
                </Text>
              </View>

              {signUpError && (
                <View className="mb-4 rounded-2xl border border-destructive bg-destructive/10 p-3">
                  <Text className="text-sm font-sans-medium text-destructive">{signUpError}</Text>
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
                    className={`auth-button ${(!code || fetchStatus === "fetching") && "auth-button-disabled"}`}
                    onPress={handleVerify}
                    disabled={!code || fetchStatus === "fetching"}
                  >
                    <Text className="auth-button-text">
                      {fetchStatus === "fetching" ? "Verifying..." : "Verify Email"}
                    </Text>
                  </Pressable>

                  <Pressable
                    className="auth-secondary-button"
                    onPress={() => signUp.verifications.sendEmailCode()}
                    disabled={fetchStatus === "fetching"}
                  >
                    <Text className="auth-secondary-button-text">Resend Code</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        className="auth-screen"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          className="auth-scroll"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="auth-content">
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
              <Text className="auth-title">Create your account</Text>
              <Text className="auth-subtitle">
                Start tracking your subscriptions and never miss a payment
              </Text>
            </View>
            {signUpError && (
              <View className="mb-4 rounded-2xl border border-destructive bg-destructive/10 p-3">
                <Text className="text-sm font-sans-medium text-destructive">{signUpError}</Text>
              </View>
            )}
            <View className="auth-card">
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">First Name</Text>
                  <TextInput
                    className="auth-input"
                    style={{ fontFamily: 'sans-medium' }}
                    value={firstName}
                    placeholder="Enter your first name"
                    placeholderTextColor="rgba(0, 0, 0, 0.4)"
                    onChangeText={setFirstName}
                    autoComplete="name-given"
                  />
                </View>

                <View className="auth-field">
                  <Text className="auth-label">Last Name</Text>
                  <TextInput
                    className="auth-input"
                    style={{ fontFamily: 'sans-medium' }}
                    value={lastName}
                    placeholder="Enter your last name"
                    placeholderTextColor="rgba(0, 0, 0, 0.4)"
                    onChangeText={setLastName}
                    autoComplete="name-family"
                  />
                </View>

                <View className="auth-field">
                  <Text className="auth-label">Email Address</Text>
                  <TextInput
                    className={`auth-input ${emailTouched && !emailValid && "auth-input-error"}`}
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
                  {errors.fields.emailAddress && (
                    <Text className="auth-error">{errors.fields.emailAddress.message}</Text>
                  )}
                </View>

                <View className="auth-field">
                  <Text className="auth-label">Password</Text>
                  <TextInput
                    className={`auth-input ${passwordTouched && !passwordValid && "auth-input-error"}`}
                    style={{ fontFamily: 'sans-medium' }}
                    value={password}
                    placeholder="Create a strong password"
                    placeholderTextColor="rgba(0, 0, 0, 0.4)"
                    secureTextEntry
                    onChangeText={setPassword}
                    onBlur={() => setPasswordTouched(true)}
                    autoComplete="password-new"
                  />
                  {passwordTouched && !passwordValid && (
                    <Text className="auth-error">Password must be at least 8 characters</Text>
                  )}
                  {errors.fields.password && (
                    <Text className="auth-error">{errors.fields.password.message}</Text>
                  )}
                  {!passwordTouched && (
                    <Text className="auth-helper">Minimum 8 characters required</Text>
                  )}
                </View>

                <Pressable
                  className={`auth-button ${(!formValid || fetchStatus === "fetching") && "auth-button-disabled"}`}
                  onPress={handleSubmit}
                  disabled={!formValid || fetchStatus === "fetching"}
                >
                  <Text className="auth-button-text">
                    {fetchStatus === "fetching" ? "Creating Account..." : "Create Account"}
                  </Text>
                </Pressable>
              </View>
            </View>

            <View className="auth-link-row">
              <Text className="auth-link-copy">Already have an account?</Text>
              <Link href="/(auth)/sign-in" asChild>
                <Pressable>
                  <Text className="auth-link">Sign In</Text>
                </Pressable>
              </Link>
            </View>

            <View nativeID="clerk-captcha" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUp;