import { View, Text, StyleSheet, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import TextInputFull from "../../components/textInput/textInputFull";
import ButtonHalf from "../../components/button/buttonHalf";

export default function AddTransactionsPage() {
  const router = useRouter();
  const [merchantName, setMerchantName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [cardUsed, setCardUsed] = useState("");
  const [notes, setNotes] = useState("");

  const handleCancel = () => {
    router.push("/(tabs)/transactions");
  };

  const handleAdd = async () => {
    // TODO: Replace with backend API call
    // const addTransaction = async () => {
    //   const response = await fetch('/api/transactions/', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       merchant_name: merchantName,
    //       amount: parseFloat(amount),
    //       category: category,
    //       card_used: cardUsed || null,
    //       notes: notes || null,
    //     }),
    //   });
    //   const data = await response.json();
    //   return data;
    // };

    // Placeholder: Call backend API
    // await addTransaction();

    // Navigate back to transactions page after adding
    router.push("/(tabs)/transactions");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.push("/(tabs)/transactions")}
          >
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </Pressable>
          <Text style={styles.title}>Add Transactions</Text>
          <View style={styles.backButtonPlaceholder} />
        </View>

        {/* Form Group */}
        <View style={styles.formGroup}>
          {/* Subtitle */}
          <Text style={styles.subtitle}>Add a Transactions</Text>

          {/* Input Fields */}
          <View style={styles.inputsContainer}>
            <View style={styles.inputWrapper}>
              <TextInputFull
                placeholder="Merchant Name"
                value={merchantName}
                onChangeText={setMerchantName}
              />
            </View>
            <View style={styles.inputSpacing} />
            <View style={styles.inputWrapper}>
              <TextInputFull
                placeholder="Amount($)"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.inputSpacing} />
            <View style={styles.inputWrapper}>
              <TextInputFull
                placeholder="Category"
                value={category}
                onChangeText={setCategory}
              />
            </View>
            <View style={styles.inputSpacing} />
            <View style={styles.inputWrapper}>
              <TextInputFull
                placeholder="Card Used(Optional)"
                value={cardUsed}
                onChangeText={setCardUsed}
              />
            </View>
            <View style={styles.inputSpacing} />
            {/* Notes field with higher height */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.notesInput}
                placeholder="Notes(Optional)"
                placeholderTextColor="#777777"
                value={notes}
                onChangeText={setNotes}
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            <ButtonHalf
              button1={{
                color: "#FFFFFF",
                text: "Cancel",
                border: "#E6EAEF",
                textColor: "#222222",
                onPress: handleCancel,
              }}
              button2={{
                color: "#5E17EB",
                text: "Add",
                textColor: "#FFFFFF",
                onPress: handleAdd,
              }}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    paddingHorizontal: 35,
    paddingTop: 20,
    paddingBottom: 80, // Space for nav bar
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  backButtonPlaceholder: {
    width: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222222",
    textAlign: "center",
    flex: 1,
  },
  formGroup: {
    marginTop: 20, // Space from header
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222222",
    marginLeft: 2, // Align with inputs (37px - 35px padding)
    marginBottom: 15, // Space from subtitle to first input
  },
  inputsContainer: {
    marginBottom: 20, // Space between inputs and buttons
  },
  inputWrapper: {
    marginHorizontal: -15, // Cancel out TextInputFull's marginHorizontal: 15
  },
  inputSpacing: {
    height: 10,
  },
  notesInput: {
    marginHorizontal: 15,
    height: 82, // Higher height for notes
    backgroundColor: "#F5F7FA",
    borderWidth: 1,
    borderColor: "#E6EAEF",
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingTop: 16,
    fontSize: 14,
    fontWeight: "600",
    color: "#222222",
  },
  buttonsContainer: {
    marginTop: 15,
    marginHorizontal: -15, // Cancel out ButtonHalf's marginHorizontal: 15 to align with inputs
  },
});
