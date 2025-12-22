import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  ScrollView,
  Platform,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface Transaction {
  id: string;
  merchant: string;
  date: string;
  category: string;
  amount: number;
}

interface Budget {
  id: string;
  monthYear: string;
  budgetAmount: number;
  spentAmount: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [screenHeight, setScreenHeight] = useState(
    Dimensions.get("window").height,
  );
  const [maxTransactions, setMaxTransactions] = useState(3);

  // TODO: Replace with backend API call
  // const fetchDashboardData = async () => {
  //   const response = await fetch('/api/dashboard/');
  //   const data = await response.json();
  //   return data;
  // };

  // Placeholder data - will be replaced with backend data
  const monthlySpending = 63.55;
  const rewardsEarned = 5.8;
  const activeBudgets = 0;
  const budgetAlerts = 0;

  // Placeholder budgets - will be replaced with backend data
  // Set to empty array to show empty state, or populate with data to show budget
  const allBudgets: Budget[] = [];

  // Placeholder transactions - will be replaced with backend data
  const allTransactions: Transaction[] = [];

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setScreenHeight(window.height);
    });

    // Calculate max transactions based on available space
    // Account for safe area insets on mobile
    const navBarHeight = Platform.OS === "ios" ? 63 : 63;
    const safeAreaTop = insets.top;
    const safeAreaBottom = insets.bottom;
    const titleHeight = 40;
    const cardsHeight = 500; // Approximate height of cards above transactions
    const transactionHeaderHeight = 50;
    const padding = 40;
    const bottomNavPadding = 80;

    const availableHeight =
      screenHeight -
      safeAreaTop -
      safeAreaBottom -
      navBarHeight -
      titleHeight -
      cardsHeight -
      transactionHeaderHeight -
      padding -
      bottomNavPadding;
    const transactionHeight = 40;
    const calculatedMax = Math.floor(availableHeight / transactionHeight);
    setMaxTransactions(Math.max(2, Math.min(calculatedMax, 3))); // Between 2-3 transactions

    return () => subscription?.remove();
  }, [screenHeight, insets.top, insets.bottom]);

  const displayedTransactions = allTransactions.slice(0, maxTransactions);
  // Get the most recent budget (if any)
  const mostRecentBudget = allBudgets.length > 0 ? allBudgets[0] : null;
  const budgetPercentage = mostRecentBudget
    ? (mostRecentBudget.spentAmount / mostRecentBudget.budgetAmount) * 100
    : 0;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>DashBoard</Text>

          {/* Cards Container */}
          <View style={styles.cardsContainer}>
            {/* This Month's Spending */}
            <View style={[styles.card, styles.cardLeft]}>
              <Text style={styles.cardLabel}>This Month&apos;s Spending</Text>
              <Text style={styles.cardValue}>
                ${monthlySpending.toFixed(2)}
              </Text>
            </View>

            {/* Rewards Earned */}
            <View style={[styles.card, styles.cardLeft]}>
              <Text style={styles.cardLabel}>Rewards Earned</Text>
              <Text style={styles.cardValue}>${rewardsEarned.toFixed(2)}</Text>
            </View>

            {/* Active Budgets & Budget Alerts Row */}
            <View style={styles.rowContainer}>
              <View style={[styles.card, styles.cardShort, styles.cardHalf]}>
                <Text style={styles.cardLabel}>Active Budgets</Text>
                <Text style={styles.cardValue}>{activeBudgets}</Text>
              </View>
              <View style={styles.rowSpacing} />
              <View style={[styles.card, styles.cardShort, styles.cardHalf]}>
                <Text style={styles.cardLabel}>Budget Alerts</Text>
                <Text style={styles.cardValue}>{budgetAlerts}</Text>
              </View>
            </View>

            {/* Budgets Status */}
            <View style={[styles.card, styles.transactionsCard]}>
              <Text style={styles.cardLabel}>Budgets Status</Text>
              {mostRecentBudget === null ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    You don&apos;t have any budget right now. Go and add first
                    one!
                  </Text>
                </View>
              ) : (
                <View style={styles.budgetsList}>
                  <View style={styles.budgetItem}>
                    <View style={styles.budgetLeft}>
                      <Text style={styles.budgetMonthYear}>
                        {mostRecentBudget.monthYear}
                      </Text>
                      <Text style={styles.budgetDetails}>
                        ${mostRecentBudget.spentAmount.toFixed(2)} / $
                        {mostRecentBudget.budgetAmount.toFixed(2)}
                      </Text>
                    </View>
                    <Text style={styles.budgetPercentage}>
                      {budgetPercentage.toFixed(0)}%
                    </Text>
                  </View>
                </View>
              )}
              <Pressable
                style={styles.linkContainer}
                onPress={() => router.push("/(tabs)/budget")}
              >
                <Text style={styles.linkText}>View all budgets</Text>
                <Ionicons name="chevron-forward" size={14} color="#5E17EB" />
              </Pressable>
            </View>

            {/* Recent Transactions */}
            <View style={[styles.card, styles.transactionsCard]}>
              <Text style={styles.cardLabel}>Recent Transactions</Text>
              {displayedTransactions.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    You don&apos;t have any transaction right now. Go and add
                    first one!
                  </Text>
                </View>
              ) : (
                <View style={styles.transactionsList}>
                  {displayedTransactions.map((transaction, index) => (
                    <View key={transaction.id}>
                      <View style={styles.transactionItem}>
                        <View style={styles.transactionLeft}>
                          <Text style={styles.transactionMerchant}>
                            {transaction.merchant}
                          </Text>
                          <Text style={styles.transactionDetails}>
                            {transaction.date} • {transaction.category}
                          </Text>
                        </View>
                        <Text style={styles.transactionAmount}>
                          ${transaction.amount.toFixed(2)}
                        </Text>
                      </View>
                      {index < displayedTransactions.length - 1 && (
                        <View style={styles.transactionDivider} />
                      )}
                    </View>
                  ))}
                </View>
              )}
              <Pressable
                style={styles.linkContainer}
                onPress={() => router.push("/(tabs)/transactions")}
              >
                <Text style={styles.linkText}>View all transactions</Text>
                <Ionicons name="chevron-forward" size={14} color="#5E17EB" />
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 80, // Space for nav bar
  },
  content: {
    paddingHorizontal: 35,
    paddingTop: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222222",
    textAlign: "center",
    marginBottom: 17,
  },
  cardsContainer: {
    gap: 17,
  },
  card: {
    backgroundColor: "#F5F7FA",
    borderWidth: 1,
    borderColor: "#E6EAEF",
    borderRadius: 20,
    padding: 17,
    alignItems: "center",
  },
  cardLeft: {
    alignItems: "flex-start",
  },
  cardShort: {
    height: 88,
    alignItems: "flex-start",
  },
  cardTall: {
    minHeight: 115,
    alignItems: "flex-start",
  },
  cardHalf: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222222",
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222222",
  },
  rowContainer: {
    flexDirection: "row",
  },
  rowSpacing: {
    width: 17,
  },
  linkContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: "auto",
    alignSelf: "flex-end",
  },
  linkText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#5E17EB",
    marginRight: 4,
  },
  budgetsList: {
    width: "100%",
    flex: 1,
  },
  budgetItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  budgetLeft: {
    flex: 1,
  },
  budgetMonthYear: {
    fontSize: 10,
    fontWeight: "600",
    color: "#222222",
    marginBottom: 4,
  },
  budgetDetails: {
    fontSize: 8,
    fontWeight: "600",
    color: "#777777",
  },
  budgetPercentage: {
    fontSize: 10,
    fontWeight: "600",
    color: "#222222",
  },
  transactionsCard: {
    minHeight: 80,
    alignItems: "flex-start",
  },
  transactionsList: {
    width: "100%",
    flex: 1,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  transactionLeft: {
    flex: 1,
  },
  transactionMerchant: {
    fontSize: 10,
    fontWeight: "600",
    color: "#222222",
    marginBottom: 4,
  },
  transactionDetails: {
    fontSize: 8,
    fontWeight: "600",
    color: "#777777",
  },
  transactionAmount: {
    fontSize: 10,
    fontWeight: "600",
    color: "#222222",
  },
  transactionDivider: {
    height: 1,
    backgroundColor: "#E6EAEF",
    marginVertical: 4,
  },
  emptyState: {
    width: "100%",
    paddingBottom: 15,
  },
  emptyStateText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#777777",
    textAlign: "left",
  },
});
