import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import ButtonFull from "../../components/button/buttonFull";
import TextInputFull from "../../components/textInput/textInputFull";

export default function LogInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/CardSense logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Welcome Text */}
        <Text style={styles.welcomeText}>Welcome Back!</Text>

        {/* Input Fields */}
        <View style={styles.inputsContainer}>
          <TextInputFull
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={styles.inputSpacing} />
          <TextInputFull
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* Remember Me & Forgot Password */}
        <View style={styles.optionsContainer}>
          <Pressable
            style={styles.rememberMeContainer}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <View
              style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
            >
              {rememberMe && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.rememberMeText}>Remember me</Text>
          </Pressable>
          <Pressable onPress={() => {}}>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </Pressable>
        </View>

        {/* Sign In Button */}
        <View style={styles.buttonContainer}>
          <ButtonFull
            color="#5E17EB"
            text="Sign In"
            textColor="#FFFFFF"
            onPress={() => {
              // Handle login logic here
              router.push("/(tabs)/dashboard");
            }}
          />
        </View>

        {/* Sign Up Link */}
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>
            Not a member?{" "}
            <Text
              style={styles.signUpLink}
              onPress={() => router.push("/(auth)/signup")}
            >
              Create new account
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignContent: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 35,
    paddingTop: 60,
  },
  logoContainer: {
    alignItems: "center",
  },
  logo: {
    width: 400,
    height: 250,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: "600",
    color: "#222222",
    textAlign: "center",
    marginBottom: 30,
  },
  inputsContainer: {
    marginBottom: 20,
  },
  inputSpacing: {
    height: 18,
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 15,
    marginBottom: 20,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#E6EAEF",
    borderRadius: 5,
    backgroundColor: "#222222",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: "#222222",
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  rememberMeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222222",
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222222",
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 30,
  },
  signUpContainer: {
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 40,
  },
  signUpText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222222",
    textAlign: "center",
  },
  signUpLink: {
    color: "#5E17EB",
  },
});
