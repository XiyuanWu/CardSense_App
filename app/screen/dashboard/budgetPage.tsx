import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ButtonSeventy from "@/components/button/buttonSeventy";

interface Budget {
  id: string;
  monthYear: string;
  budgetAmount: number;
  spentAmount: number;
}

export default function BudgetPage() {
  const router = useRouter();

  // TODO: Replace with backend API call
  // const fetchBudgets = async () => {
  //   const response = await fetch('/api/budgets/');
  //   const data = await response.json();
  //   return data;
  // };

  // Placeholder data - will be replaced with backend data
  // Set to empty array to show empty state, or populate with data to show budgets
  const budgets: Budget[] = [];

  const handleDelete = (id: string) => {
    // TODO: Replace with backend API call
    // const deleteBudget = async () => {
    //   const response = await fetch(`/api/budgets/${id}/`, {
    //     method: 'DELETE',
    //   });
    //   return response;
    // };
    // await deleteBudget();
    console.log("Delete budget:", id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </Pressable>
          <Text style={styles.title}>Budgets</Text>
          <Pressable
            style={styles.iconButton}
            onPress={() => router.push("/(tabs)/addBudget")}
          >
            <Ionicons name="add" size={24} color="#000000" />
          </Pressable>
        </View>

        {/* Budgets List or Empty State */}
        {budgets.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateContent}>
              <Text style={styles.emptyStateTitle}>
                You don&apos;t have a budget yet.{"\n"}Add one now!
              </Text>
              <ButtonSeventy
                text="Add Budget"
                onPress={() => router.push("/(tabs)/addBudget")}
              />
            </View>
          </View>
        ) : (
          <ScrollView
            style={styles.budgetsList}
            contentContainerStyle={styles.budgetsListContent}
            showsVerticalScrollIndicator={false}
          >
            {budgets.map((budget) => {
              const remaining = budget.budgetAmount - budget.spentAmount;
              return (
                <View key={budget.id} style={styles.budgetCard}>
                  <View style={styles.budgetLeft}>
                    <Text style={styles.budgetMonth}>{budget.monthYear}</Text>
                    <Text style={styles.budgetLabel}>
                      Budgets: ${budget.budgetAmount}
                    </Text>
                  </View>
                  <View style={styles.budgetRight}>
                    <Text style={styles.budgetSpent}>
                      ${budget.spentAmount}
                    </Text>
                    <Text style={styles.budgetRemaining}>
                      ${remaining} remaining
                    </Text>
                    <Pressable
                      style={styles.deleteButton}
                      onPress={() => handleDelete(budget.id)}
                    >
                      <Text style={styles.deleteText}>Delete</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
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
    paddingBottom: 20, // No nav bar on this page
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222222",
    textAlign: "center",
    flex: 1,
  },
  budgetsList: {
    flex: 1,
  },
  budgetsListContent: {
    gap: 17,
    paddingBottom: 20,
  },
  budgetCard: {
    backgroundColor: "#F5F7FA",
    borderWidth: 1,
    borderColor: "#E6EAEF",
    borderRadius: 20,
    padding: 17,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 105,
  },
  budgetLeft: {
    flex: 1,
  },
  budgetMonth: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222222",
    marginBottom: 8,
  },
  budgetLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#777777",
  },
  budgetRight: {
    alignItems: "flex-end",
  },
  budgetSpent: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222222",
    marginBottom: 8,
  },
  budgetRemaining: {
    fontSize: 14,
    fontWeight: "600",
    color: "#777777",
    marginBottom: 8,
  },
  deleteButton: {
    marginTop: 4,
  },
  deleteText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#DC2527",
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
  addButtonEmpty: {
    backgroundColor: "#5E17EB",
    height: 50,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    width: "66%",
    paddingHorizontal: 20,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
