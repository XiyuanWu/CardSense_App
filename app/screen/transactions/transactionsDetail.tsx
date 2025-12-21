import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

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

export default function TransactionsDetailPage() {
  const router = useRouter();
  const { transactionId } = useLocalSearchParams<{ transactionId: string }>();

  // TODO: Replace with backend API call
  // const fetchTransactionDetail = async (id: string) => {
  //   const response = await fetch(`/api/transactions/${id}/`);
  //   const data = await response.json();
  //   return data;
  // };

  // Placeholder data - will be replaced with backend data
  // When backend is ready, use transactionId from params to fetch the transaction
  const transaction: TransactionDetail = {
    id: transactionId || "1",
    merchant: "Amazon",
    amount: 48.59,
    date: "Dec 18, 2025",
    category: "Online Shopping",
    cardUsed: "Boa Customized Cash Rewards",
    rewardEarned: 1.46,
    rewardPercent: 3,
  };

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
              value={`$${transaction.rewardEarned.toFixed(2)} (${transaction.rewardPercent}%)`}
              isLast
            />
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
});
