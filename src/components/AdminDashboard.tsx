import { useState, useEffect } from "react";
import { collection, query, onSnapshot, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Helper } from "../types";
import { Button } from "./ui/button";
import { Trash2, Users, LayoutDashboard, CalendarCheck, ShieldAlert, DollarSign, CheckCircle2, Ban, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { handleFirestoreError, OperationType } from "../lib/firestore-error";

interface AdminDashboardProps {
  onBack: () => void;
}

export default function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [helpers, setHelpers] = useState<Helper[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "helpers" | "bookings" | "users" | "transactions">("overview");
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = auth.currentUser?.email === 'ishansrivastavaaa@gmail.com';

  useEffect(() => {
    if (!isAdmin) {
      onBack();
      return;
    }

    // Fetch Helpers
    const qHelpers = query(collection(db, "helpers"));
    const unsubHelpers = onSnapshot(
      qHelpers,
      (snapshot) => {
        setHelpers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Helper)));
        setIsLoading(false);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, "helpers")
    );

    // Fetch Bookings
    const qBookings = query(collection(db, "bookings"));
    const unsubBookings = onSnapshot(
      qBookings,
      (snapshot) => {
        const bks = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Sort by createdAt descending
        bks.sort((a: any, b: any) => {
          const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return tB - tA;
        });
        setBookings(bks);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, "bookings")
    );

    // Fetch Users
    const qUsers = query(collection(db, "users"));
    const unsubUsers = onSnapshot(
      qUsers,
      (snapshot) => {
        setUsers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (error) => handleFirestoreError(error, OperationType.LIST, "users")
    );

    // Fetch Transactions (Aggregated from helper invoices for legal records)
    // In a real production app, we would have a dedicated 'transactions' collection
    // For now, we listen to all invoices across all helpers (if permissions allow)
    // Or we stick to a main 'transactions' collection if we implement it.
    // Let's assume a 'transactions' collection for legal purposes as requested.
    const qTrans = query(collection(db, "transactions"));
    const unsubTrans = onSnapshot(
      qTrans,
      (snapshot) => {
        const trans = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        trans.sort((a: any, b: any) => {
          const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return tB - tA;
        });
        setTransactions(trans);
      },
      (error) => {
        // Fallback or ignore if transactions collection doesn't exist yet
        console.warn("Transactions collection not accessible or empty");
      }
    );

    return () => {
      unsubHelpers();
      unsubBookings();
      unsubUsers();
      unsubTrans();
    };
  }, []);

  const handleToggleBlock = async (id: string, type: 'users' | 'helpers', currentlyBlocked: boolean) => {
    const action = currentlyBlocked ? 'unblock' : 'block';
    if (!window.confirm(`Are you sure you want to ${action} this ${type.slice(0, -1)}?`)) return;
    
    try {
      const ref = doc(db, type, id);
      await updateDoc(ref, {
        blocked: !currentlyBlocked
      });
      toast.success(`${type.slice(0, -1)} ${action}ed successfully`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${type}/${id}`);
    }
  };

  const handleDeleteHelper = async (helperId: string) => {
    if (!window.confirm("Are you sure you want to delete this helper?")) return;
    try {
      await deleteDoc(doc(db, "helpers", helperId));
      toast.success("Helper deleted successfully");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `helpers/${helperId}`);
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;
    try {
      await deleteDoc(doc(db, "bookings", bookingId));
      toast.success("Booking deleted successfully");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `bookings/${bookingId}`);
    }
  };

  if (isLoading) {
    return <div className="py-24 text-center">Loading admin data...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-24 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-serif font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage your platform's helpers and bookings.</p>
        </div>
        <Button variant="outline" onClick={onBack}>Back to Home</Button>
      </div>

      <div className="flex gap-4 mb-8 border-b pb-4 overflow-x-auto">
        <Button
          variant={activeTab === "overview" ? "default" : "ghost"}
          onClick={() => setActiveTab("overview")}
          className="flex gap-2"
        >
          <LayoutDashboard className="h-4 w-4" /> Overview
        </Button>
        <Button
          variant={activeTab === "helpers" ? "default" : "ghost"}
          onClick={() => setActiveTab("helpers")}
          className="flex gap-2"
        >
          <Users className="h-4 w-4" /> Helpers ({helpers.length})
        </Button>
        <Button
          variant={activeTab === "bookings" ? "default" : "ghost"}
          onClick={() => setActiveTab("bookings")}
          className="flex gap-2"
        >
          <CalendarCheck className="h-4 w-4" /> Bookings ({bookings.length})
        </Button>
        <Button
          variant={activeTab === "users" ? "default" : "ghost"}
          onClick={() => setActiveTab("users")}
          className="flex gap-2"
        >
          <UserCheck className="h-4 w-4" /> Users ({users.length})
        </Button>
        <Button
          variant={activeTab === "transactions" ? "default" : "ghost"}
          onClick={() => setActiveTab("transactions")}
          className="flex gap-2"
        >
          <DollarSign className="h-4 w-4" /> Transactions ({transactions.length})
        </Button>
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card p-6 rounded-2xl border shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-muted-foreground font-medium text-xs uppercase tracking-widest">Total Helpers</p>
                <h3 className="text-3xl font-bold">{helpers.length}</h3>
              </div>
            </div>
          </div>
          <div className="bg-card p-6 rounded-2xl border shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <CalendarCheck className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-muted-foreground font-medium text-xs uppercase tracking-widest">Total Bookings</p>
                <h3 className="text-3xl font-bold">{bookings.length}</h3>
              </div>
            </div>
          </div>
          <div className="bg-card p-6 rounded-2xl border shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <UserCheck className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-muted-foreground font-medium text-xs uppercase tracking-widest">Total Users</p>
                <h3 className="text-3xl font-bold">{users.length}</h3>
              </div>
            </div>
          </div>
          <div className="bg-card p-6 rounded-2xl border shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-muted-foreground font-medium text-xs uppercase tracking-widest">Revenue</p>
                <h3 className="text-3xl font-bold">₹{transactions.reduce((acc, curr) => acc + (parseInt(curr.amount?.replace(/[^0-9]/g, '') || '0')), 0)}</h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "helpers" && (
        <div className="bg-card rounded-2xl border shadow-sm overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {helpers.map((h) => (
                <tr key={h.id} className="hover:bg-muted/30">
                  <td className="px-6 py-4 font-medium text-foreground">{h.name || "Untitled"}</td>
                  <td className="px-6 py-4">{h.category || "N/A"}</td>
                  <td className="px-6 py-4">
                    {h.blocked ? (
                      <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                        <Ban className="h-3 w-3" /> Blocked
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 flex items-center gap-1 w-fit">
                        <CheckCircle2 className="h-3 w-3" /> Active
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleToggleBlock(h.id!, 'helpers', h.blocked || false)}
                      className={h.blocked ? "text-green-600 hover:bg-green-100" : "text-amber-600 hover:bg-amber-100"}
                    >
                      {h.blocked ? <UserCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteHelper(h.id!)} className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "users" && (
        <div className="bg-card rounded-2xl border shadow-sm overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Display Name</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-muted/30">
                  <td className="px-6 py-4 font-medium text-foreground">{u.email}</td>
                  <td className="px-6 py-4">{u.displayName || "N/A"}</td>
                  <td className="px-6 py-4">
                    {u.blocked ? (
                      <Badge variant="destructive">Blocked</Badge>
                    ) : (
                      <Badge variant="outline" className="text-green-600">Active</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleToggleBlock(u.id, 'users', u.blocked || false)}
                      className={u.blocked ? "text-green-600 hover:bg-green-100" : "text-amber-600 hover:bg-amber-100"}
                    >
                      {u.blocked ? "Unblock" : "Block"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "transactions" && (
        <div className="bg-card rounded-2xl border shadow-sm overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Customer ID</th>
                <th className="px-6 py-4 font-medium">Helper ID</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {transactions.length > 0 ? transactions.map((t) => (
                <tr key={t.id} className="hover:bg-muted/30">
                  <td className="px-6 py-4 font-medium">{new Date(t.date).toLocaleString()}</td>
                  <td className="px-6 py-4 font-bold text-green-600">{t.amount}</td>
                  <td className="px-6 py-4 text-xs font-mono">{t.userId}</td>
                  <td className="px-6 py-4 text-xs font-mono">{t.helperId}</td>
                </tr>
              )) : (
                <tr>
                   <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No transactions recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "bookings" && (
        <div className="bg-card rounded-2xl border shadow-sm overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Helper</th>
                <th className="px-6 py-4 font-medium">Customer ID</th>
                <th className="px-6 py-4 font-medium">Status / Payment</th>
                <th className="px-6 py-4 font-medium">Date & Time</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-muted/30">
                  <td className="px-6 py-4 font-medium text-foreground">{b.helperName || b.helperId}</td>
                  <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{b.userId}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-primary">{b.status}</span>
                      <span className="text-xs text-muted-foreground">{b.paymentStatus || 'Pending'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {b.date} at {b.time}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteBooking(b.id)} className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No bookings found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
