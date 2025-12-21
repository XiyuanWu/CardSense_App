import { View, Text, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import ButtonFull from "../../components/button/buttonFull";
import TextInputFull from "../../components/textInput/textInputFull";
import TextInputHalf from "../../components/textInput/textInputHalf";

export default function SignUpPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>Create Account</Text>

        {/* Name Fields - Half Width */}
        <TextInputHalf
          placeholder1="First name"
          placeholder2="Last name"
          value1={firstName}
          value2={lastName}
          onChangeText1={setFirstName}
          onChangeText2={setLastName}
          input1Props={{ autoCapitalize: "words" }}
          input2Props={{ autoCapitalize: "words" }}
        />

        {/* Full Width Input Fields */}
        <View style={styles.inputsContainer}>
          <TextInputFull
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={styles.inputSpacing} />
          <TextInputFull
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <View style={styles.inputSpacing} />
          <TextInputFull
            placeholder="Enter your password again"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        {/* Create Account Button */}
        <View style={styles.buttonContainer}>
          <ButtonFull
            color="#5E17EB"
            text="Create Account"
            textColor="#FFFFFF"
            onPress={() => {
              // Handle sign up logic here
              Alert.alert("Account created!");
              router.push("/(auth)/login");
            }}
          />
        </View>

        {/* Log In Link */}
        <View style={styles.logInContainer}>
          <Text style={styles.logInText}>
            Already have an account?{" "}
            <Text
              style={styles.logInLink}
              onPress={() => router.push("/(auth)/login")}
            >
              Log in
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
    justifyContent: "center",
  },
  title: {
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
  buttonContainer: {
    marginTop: 10,
    marginBottom: 30,
  },
  logInContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  logInText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222222",
    textAlign: "center",
  },
  logInLink: {
    color: "#5E17EB",
  },
});
