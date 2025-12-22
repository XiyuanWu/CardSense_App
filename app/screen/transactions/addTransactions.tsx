import { View, Text, StyleSheet, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import TextInputFull from "../../components/textInput/textInputFull";
import ButtonHalf from "../../components/button/buttonHalf";
import DropDown from "../../components/textInput/dropDown";

export default function AddTransactionsPage() {
  const router = useRouter();
  const [merchantName, setMerchantName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [cardUsed, setCardUsed] = useState("");
  const [notes, setNotes] = useState("");
  const [bestCard, setBestCard] = useState("");

  // TODO: Replace with backend API call
  // const fetchUserCards = async () => {
  //   const response = await fetch('/api/cards/');
  //   const data = await response.json();
  //   return data;
  // };

  // Placeholder categories - will be replaced with backend data
  const categories = [
    { label: "Dining", value: "Dining" },
    { label: "Groceries", value: "Groceries" },
    { label: "Gas", value: "Gas" },
    { label: "Shopping", value: "Shopping" },
    { label: "Online Shopping", value: "Online Shopping" },
    { label: "Entertainment", value: "Entertainment" },
    { label: "Travel", value: "Travel" },
    { label: "Bills", value: "Bills" },
    { label: "Other", value: "Other" },
  ];

  // Placeholder user cards - will be replaced with backend data
  // const userCards = await fetchUserCards();
  const userCards = [
    { label: "Chase Sapphire Preferred", value: "chase_sapphire_preferred" },
    { label: "Boa Customized Cash Rewards", value: "boa_customized_cash" },
    { label: "Amex Gold", value: "amex_gold" },
  ];

  // TODO: Replace with backend API call
  // const getBestCard = async (category: string) => {
  //   const response = await fetch(`/api/transactions/best-card/?category=${category}`);
  //   const data = await response.json();
  //   return data.card_name;
  // };

  // Update best card recommendation when category changes
  useEffect(() => {
    if (category) {
      // Placeholder - will fetch from backend based on category
      setBestCard("Chase Sapphire Preferred");
      // TODO: Replace with backend API call
      // const fetchBestCard = async () => {
      //   const card = await getBestCard(category);
      //   setBestCard(card);
      // };
      // fetchBestCard();
    } else {
      setBestCard("");
    }
  }, [category]);

  const handleCancel = () => {
    router.push("/(tabs)/transactions");
  };

  const handleAmountChange = (text: string) => {
    // Only allow numbers and decimal point
    const numericValue = text.replace(/[^0-9.]/g, "");
    // Ensure only one decimal point
    const parts = numericValue.split(".");
    if (parts.length > 2) {
      setAmount(parts[0] + "." + parts.slice(1).join(""));
    } else {
      setAmount(numericValue);
    }
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
                onChangeText={handleAmountChange}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.inputSpacing} />
            <View style={styles.inputWrapper}>
              <DropDown
                placeholder="Select Category"
                items={categories}
                selectedValue={category}
                onValueChange={setCategory}
              />
            </View>
            <View style={styles.inputSpacing} />
            <View style={styles.inputWrapper}>
              <DropDown
                placeholder="Select Card (Optional)"
                items={userCards}
                selectedValue={cardUsed}
                onValueChange={setCardUsed}
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

          {/* Best Card Recommendation */}
          {category && (
            <View style={styles.bestCardSection}>
              <Text style={styles.bestCardText}>
                Base on your selection, the best card for this category is:
              </Text>
              <View style={styles.bestCardBox}>
                <Text style={styles.bestCardName}>{bestCard}</Text>
              </View>
            </View>
          )}

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
  bestCardSection: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  bestCardText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222222",
    textAlign: "center",
    marginBottom: 10,
    paddingHorizontal: 15,
  },
  bestCardBox: {
    width: "100%",
    height: 38,
    backgroundColor: "#F5F7FA",
    borderWidth: 1,
    borderColor: "#E6EAEF",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  bestCardName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222222",
    textAlign: "center",
  },
  buttonsContainer: {
    marginTop: 15,
    marginHorizontal: -15, // Cancel out ButtonHalf's marginHorizontal: 15 to align with inputs
  },
});
