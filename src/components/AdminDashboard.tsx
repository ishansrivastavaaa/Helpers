import { useState, useEffect } from "react";
import { collection, query, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Helper } from "../types";
import { Button } from "./ui/button";
import { Trash2, Users, LayoutDashboard, CalendarCheck } from "lucide-react";
import { toast } from "sonner";
import { handleFirestoreError, OperationType } from "../lib/firestore-error";

interface AdminDashboardProps {
  onBack: () => void;
}

export default function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [helpers, setHelpers] = useState<Helper[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "helpers" | "bookings">("overview");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
        setBookings(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (error) => handleFirestoreError(error, OperationType.LIST, "bookings")
    );

    return () => {
      unsubHelpers();
      unsubBookings();
    };
  }, []);

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
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card p-6 rounded-2xl border shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-muted-foreground font-medium">Total Helpers</p>
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
                <p className="text-muted-foreground font-medium">Total Bookings</p>
                <h3 className="text-3xl font-bold">{bookings.length}</h3>
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
                <th className="px-6 py-4 font-medium">Rating</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {helpers.map((h) => (
                <tr key={h.id} className="hover:bg-muted/30">
                  <td className="px-6 py-4 font-medium text-foreground">{h.name || "Untitled"}</td>
                  <td className="px-6 py-4">{h.category || "N/A"}</td>
                  <td className="px-6 py-4">{h.rating || 0} ⭐ ({h.reviewCount || 0} reviews)</td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteHelper(h.id!)} className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {helpers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No helpers found.</td>
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
