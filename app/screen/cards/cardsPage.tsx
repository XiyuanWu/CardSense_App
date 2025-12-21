import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ButtonSeventy from "@/components/button/buttonSeventy";
import Card from "@/components/cards/card";

interface UserCard {
  id: string;
  bankName: string;
  cardName: string;
  annualFee: string;
  ftf: string;
  rewards: string[];
}

export default function CardsPage() {
  const router = useRouter();

  // TODO: Replace with backend API call
  // const fetchCards = async () => {
  //   const response = await fetch('/api/cards/');
  //   const data = await response.json();
  //   return data;
  // };

  // Placeholder data - will be replaced with backend data
  // Set to empty array to show empty state, or populate with data to show cards
  const userCards: UserCard[] = [];

  const handleDelete = (id: string) => {
    // TODO: Replace with backend API call
    // const deleteCard = async () => {
    //   const response = await fetch(`/api/cards/${id}/`, {
    //     method: 'DELETE',
    //   });
    //   return response;
    // };
    // await deleteCard();
    console.log("Delete card:", id);
  };

  // Helper function to render cards in rows of 2
  const renderCardRows = () => {
    const rows = [];
    for (let i = 0; i < userCards.length; i += 2) {
      const cardPair = userCards.slice(i, i + 2);
      rows.push(
        <View key={i} style={styles.cardRow}>
          {cardPair.map((card) => (
            <Card
              key={card.id}
              bankName={card.bankName}
              cardName={card.cardName}
              annualFee={card.annualFee}
              ftf={card.ftf}
              rewards={card.rewards}
              iconType="-"
              onPress={() => handleDelete(card.id)}
            />
          ))}
          {cardPair.length === 1 && <View style={styles.cardSpacer} />}
        </View>,
      );
    }
    return rows;
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Cards</Text>
          <Pressable
            style={styles.addButton}
            onPress={() => {
              router.push("/(tabs)/addCards");
            }}
          >
            <Ionicons name="add" size={24} color="#000000" />
          </Pressable>
        </View>

        {/* Cards List or Empty State */}
        {userCards.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateContent}>
              <Text style={styles.emptyStateTitle}>
                You don&apos;t have a card yet.{"\n"}Add one now!
              </Text>
              <ButtonSeventy
                text="Add Cards"
                onPress={() => {
                  router.push("/(tabs)/addCards");
                }}
              />
            </View>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Section Header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Cards</Text>
              <Text style={styles.sectionDescription}>
                Here is a list all your current cards.
              </Text>
            </View>

            {/* Cards Grid */}
            <View style={styles.cardsGrid}>{renderCardRows()}</View>
          </ScrollView>
        )}
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
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222222",
    textAlign: "center",
    marginLeft: 30,
    flex: 1,
  },
  addButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
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
  cardsGrid: {
    gap: 15,
  },
  cardRow: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 15,
  },
  cardWrapper: {
    flex: 1,
  },
  cardSpacer: {
    flex: 1,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateContent: {
    alignItems: "center",
    gap: 16,
    width: 350,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222222",
    textAlign: "center",
    lineHeight: 28,
  },
});
