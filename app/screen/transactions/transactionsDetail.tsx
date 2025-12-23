import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { getTransaction } from "../../utils/api";

interface TransactionDetail {
  id: string;
  merchant: string;
  amount: number;
  date: string;
  category: string;
  cardUsed: string;
  rewardEarned: number;
  rewardPercent: number;
}

// Category mapping: backend code -> display name
const categoryMap: Record<string, string> = {
  DINING: "Dining",
  GROCERIES: "Groceries",
  GAS: "Gas",
  ONLINE_SHOPPING: "Online Shopping",
  ENTERTAINMENT: "Entertainment",
  GENERAL_TRAVEL: "General Travel",
  AIRLINE_TRAVEL: "Airline Travel",
  HOTEL_TRAVEL: "Hotel Travel",
  TRANSIT: "Transit",
  PHARMACY: "Pharmacy",
  RENT: "Rent",
  OTHER: "Other",
  SELECTED_CATEGORIES: "Selected Categories",
};

// Format date for display
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  } catch {
    return dateString;
  }
}

export default function TransactionsDetailPage() {
  const router = useRouter();
  const { transactionId } = useLocalSearchParams<{ transactionId: string }>();
  const [transaction, setTransaction] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactionDetail = async () => {
      if (!transactionId) {
        Alert.alert("Error", "Transaction ID is missing");
        router.back();
        return;
      }

      setLoading(true);
      try {
        const response = await getTransaction(transactionId);
        if (response.success && response.data) {
          const tx = response.data;
          const amount = parseFloat(tx.amount);
          const rewardEarned = parseFloat(tx.actual_reward || "0");
          const rewardPercent = amount > 0 ? (rewardEarned / amount) * 100 : 0;

          const transactionDetail: TransactionDetail = {
            id: tx.id.toString(),
            merchant: tx.merchant,
            amount: amount,
            date: formatDate(tx.created_at),
            category: categoryMap[tx.category] || tx.category,
            cardUsed: tx.card_actually_used_details
              ? `${tx.card_actually_used_details.issuer} ${tx.card_actually_used_details.name}`
              : "No card specified",
            rewardEarned: rewardEarned,
            rewardPercent: rewardPercent,
          };

          setTransaction(transactionDetail);
        } else {
          if (!response.success) {
            const errorMessage = "error" in response ? response.error.message : "Failed to fetch transaction";
            Alert.alert("Error", errorMessage, [
              {
                text: "OK",
                onPress: () => router.back(),
              },
            ]);
          }
        }
      } catch (error) {
        console.error("Error fetching transaction detail:", error);
        Alert.alert("Error", "An error occurred while loading the transaction", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionDetail();
  }, [transactionId, router]);

  const DetailRow = ({
    label,
    value,
    isLast,
  }: {
    label: string;
    value: string;
    isLast?: boolean;
  }) => (
    <View style={[styles.detailRow, isLast && styles.detailRowLast]}>
      <Text style={styles.detailLabel}>{label}</Text>
      <View style={styles.divider} />
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </Pressable>
          <Text style={styles.title}>Transactions Detail</Text>
          <View style={styles.backButtonPlaceholder} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#5E17EB" />
          </View>
        ) : transaction ? (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Summary Card */}
            <View style={styles.summaryCard}>
              <Text style={styles.merchantName}>{transaction.merchant}</Text>
              <Text style={styles.amount}>${transaction.amount.toFixed(2)}</Text>
            </View>

            {/* Details Card */}
            <View style={styles.detailsCard}>
              <DetailRow label="Transactions Date" value={transaction.date} />
              <DetailRow label="Category" value={transaction.category} />
              <DetailRow label="Card Used" value={transaction.cardUsed} />
              <DetailRow
                label="Reward Earned"
                value={`$${transaction.rewardEarned.toFixed(2)} (${transaction.rewardPercent.toFixed(2)}%)`}
                isLast
              />
            </View>
          </ScrollView>
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Transaction not found</Text>
          </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  summaryCard: {
    backgroundColor: "#F5F7FA",
    borderWidth: 1,
    borderColor: "#E6EAEF",
    borderRadius: 20,
    padding: 19,
    height: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 17,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222222",
  },
  amount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222222",
  },
  detailsCard: {
    backgroundColor: "#F5F7FA",
    borderWidth: 1,
    borderColor: "#E6EAEF",
    borderRadius: 20,
    padding: 17,
    minHeight: 107,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 23,
    minHeight: 17,
    position: "relative",
  },
  detailRowLast: {
    marginBottom: 0,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#777777",
    width: 100,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#E6EAEF",
    marginHorizontal: 18,
  },
  detailValue: {
    fontSize: 10,
    fontWeight: "600",
    color: "#777777",
    textAlign: "right",
    width: 163,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#777777",
  },
});
