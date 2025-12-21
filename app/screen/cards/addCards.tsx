import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Card from "@/components/cards/card";

interface AvailableCardData {
  id: string;
  bankName: string;
  cardName: string;
  annualFee: string;
  ftf: string;
  rewards: string[];
}

export default function AddCardsPage() {
  const router = useRouter();

  // TODO: Replace with backend API call
  // const fetchAvailableCards = async () => {
  //   const response = await fetch('/api/cards/available/');
  //   const data = await response.json();
  //   return data;
  // };

  // Placeholder data - will be replaced with backend data
  const availableCards: AvailableCardData[] = [
    {
      id: "1",
      bankName: "Chase",
      cardName: "Sapphire Preferred",
      annualFee: "$95",
      ftf: "No",
      rewards: [
        "3.1x on Dining, Groceries, Entertainment",
        "2.1x on General Travel",
        "1.1x on Other",
      ],
    },
    {
      id: "2",
      bankName: "Chase",
      cardName: "Sapphire Preferred",
      annualFee: "$95",
      ftf: "No",
      rewards: [
        "3.1x on Dining, Groceries, Entertainment",
        "2.1x on General Travel",
        "1.1x on Other",
      ],
    },
    {
      id: "3",
      bankName: "Chase",
      cardName: "Sapphire Preferred",
      annualFee: "$95",
      ftf: "No",
      rewards: [
        "3.1x on Dining, Groceries, Entertainment",
        "2.1x on General Travel",
        "1.1x on Other",
      ],
    },
    {
      id: "4",
      bankName: "Chase",
      cardName: "Sapphire Preferred",
      annualFee: "$95",
      ftf: "No",
      rewards: [
        "3.1x on Dining, Groceries, Entertainment",
        "2.1x on General Travel",
        "1.1x on Other",
      ],
    },
    {
      id: "5",
      bankName: "Chase",
      cardName: "Sapphire Preferred",
      annualFee: "$95",
      ftf: "No",
      rewards: [
        "3.1x on Dining, Groceries, Entertainment",
        "2.1x on General Travel",
        "1.1x on Other",
      ],
    },
    {
      id: "6",
      bankName: "Chase",
      cardName: "Sapphire Preferred",
      annualFee: "$95",
      ftf: "No",
      rewards: [
        "3.1x on Dining, Groceries, Entertainment",
        "2.1x on General Travel",
        "1.1x on Other",
      ],
    },
  ];

  const handleAddCard = (cardId: string) => {
    // TODO: Replace with backend API call
    // const addCard = async () => {
    //   const response = await fetch('/api/cards/', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ card_id: cardId }),
    //   });
    //   const data = await response.json();
    //   return data;
    // };
    // await addCard();
    console.log("Add card:", cardId);
    // Optionally navigate back after adding
    // router.push('/(tabs)/cards');
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.push("/(tabs)/cards")}
          >
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </Pressable>
          <Text style={styles.title}>Add Cards</Text>
          <View style={styles.backButtonPlaceholder} />
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Cards</Text>
          <Text style={styles.sectionDescription}>
            Browse our database of credit cards to find the best fit for you!
          </Text>
        </View>

        {/* Cards List - Scrollable */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.cardsList}>
            {availableCards.map((card) => (
              <View key={card.id} style={styles.cardWrapper}>
                <Card
                  bankName={card.bankName}
                  cardName={card.cardName}
                  annualFee={card.annualFee}
                  ftf={card.ftf}
                  rewards={card.rewards}
                  iconType="+"
                  onPress={() => handleAddCard(card.id)}
                />
              </View>
            ))}
          </View>
        </ScrollView>
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
    paddingBottom: 20, // No nav bar on this page
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
  sectionHeader: {
    marginBottom: 21,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222222",
    marginBottom: 2,
  },
  sectionDescription: {
    fontSize: 10,
    fontWeight: "600",
    color: "#777777",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  cardsList: {
    gap: 15,
  },
  cardWrapper: {
    width: "100%",
  },
});
