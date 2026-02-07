import { useState } from "react";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { Star, Check, X, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import AdminBreadcrumb from "../components/AdminBreadcrumb";

type ReviewStatus = "pending" | "approved" | "rejected";

export default function AdminBewertungen() {
  const [activeTab, setActiveTab] = useState<ReviewStatus | "all">("pending");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);

  const utils = trpc.useUtils();

  // Fetch reviews based on active tab
  const { data: allReviews, isLoading } = trpc.reviews.listAll.useQuery();
  const { data: pendingReviews } = trpc.reviews.listPending.useQuery();
  const { data: stats } = trpc.reviews.getStats.useQuery();

  const approveMutation = trpc.reviews.approve.useMutation({
    onSuccess: () => {
      toast.success("Bewertung freigegeben!");
      utils.reviews.listAll.invalidate();
      utils.reviews.listPending.invalidate();
      utils.reviews.getStats.invalidate();
    },
    onError: (error) => {
      toast.error("Fehler beim Freigeben", { description: error.message });
    },
  });

  const rejectMutation = trpc.reviews.reject.useMutation({
    onSuccess: () => {
      toast.success("Bewertung abgelehnt!");
      utils.reviews.listAll.invalidate();
      utils.reviews.listPending.invalidate();
      utils.reviews.getStats.invalidate();
    },
    onError: (error) => {
      toast.error("Fehler beim Ablehnen", { description: error.message });
    },
  });

  const deleteMutation = trpc.reviews.delete.useMutation({
    onSuccess: () => {
      toast.success("Bewertung gelöscht!");
      utils.reviews.listAll.invalidate();
      utils.reviews.listPending.invalidate();
      utils.reviews.getStats.invalidate();
      setDeleteDialogOpen(false);
      setSelectedReviewId(null);
    },
    onError: (error) => {
      toast.error("Fehler beim Löschen", { description: error.message });
    },
  });

  const handleApprove = (id: number) => {
    approveMutation.mutate({ id });
  };

  const handleReject = (id: number) => {
    rejectMutation.mutate({ id });
  };

  const handleDelete = () => {
    if (selectedReviewId) {
      deleteMutation.mutate({ id: selectedReviewId });
    }
  };

  const getStatusBadge = (status: ReviewStatus) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Ausstehend</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Freigegeben</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Abgelehnt</Badge>;
    }
  };

  const getAnonymizedName = (name: string, anonymityLevel: string) => {
    const parts = name.trim().split(/\s+/);
    const firstName = parts[0] || "";
    const lastName = parts[parts.length - 1] || "";

    switch (anonymityLevel) {
      case "full":
        return name;
      case "first_initial":
        return `${firstName} ${lastName.charAt(0).toUpperCase()}.`;
      case "initials":
        return `${firstName.charAt(0).toUpperCase()}. ${lastName.charAt(0).toUpperCase()}.`;
      case "anonymous":
        return "Anonymer Klient";
      default:
        return name;
    }
  };

  const filteredReviews = allReviews?.filter((review) => {
    if (activeTab === "all") return true;
    return review.status === activeTab;
  });

  const selectedReview = allReviews?.find((r) => r.id === selectedReviewId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-gray-600">Lade Bewertungen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <AdminBreadcrumb
          items={[
            { label: "Admin", href: "/admin" },
            { label: "Bewertungen", href: "/admin/bewertungen" },
          ]}
        />

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bewertungen</h1>
            <p className="text-gray-600 mt-1">Verwalte Klienten-Bewertungen</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Gesamt</CardDescription>
              <CardTitle className="text-3xl">{stats?.total || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Ausstehend</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">{stats?.pending || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Freigegeben</CardDescription>
              <CardTitle className="text-3xl text-green-600">{stats?.approved || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Durchschnitt</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-1">
                {stats?.averageRating ? stats.averageRating.toFixed(1) : "0.0"}
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ReviewStatus | "all")}>
          <TabsList className="mb-6">
            <TabsTrigger value="pending">
              Ausstehend {pendingReviews && pendingReviews.length > 0 && `(${pendingReviews.length})`}
            </TabsTrigger>
            <TabsTrigger value="approved">Freigegeben</TabsTrigger>
            <TabsTrigger value="rejected">Abgelehnt</TabsTrigger>
            <TabsTrigger value="all">Alle</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredReviews && filteredReviews.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500">Keine Bewertungen gefunden.</p>
                </CardContent>
              </Card>
            ) : (
              filteredReviews?.map((review) => (
                <Card key={review.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusBadge(review.status as ReviewStatus)}
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <CardTitle className="text-lg">
                          {review.name} ({review.email})
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Eingereicht am {new Date(review.createdAt).toLocaleDateString("de-DE", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {review.text && (
                      <p className="text-gray-700 mb-4 whitespace-pre-wrap">{review.text}</p>
                    )}
                    
                    <div className="bg-gray-50 p-3 rounded-lg mb-4">
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Öffentliche Signatur:</strong> {getAnonymizedName(review.name, review.anonymityLevel)}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Anonymitätsstufe:</strong>{" "}
                        {review.anonymityLevel === "full" && "Vollständiger Name"}
                        {review.anonymityLevel === "first_initial" && "Vorname + Nachname-Initial"}
                        {review.anonymityLevel === "initials" && "Nur Initialen"}
                        {review.anonymityLevel === "anonymous" && "Anonym"}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {review.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(review.id)}
                            disabled={approveMutation.isPending}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Freigeben
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(review.id)}
                            disabled={rejectMutation.isPending}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Ablehnen
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedReviewId(review.id);
                          setPreviewDialogOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Vorschau
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedReviewId(review.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Löschen
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Bewertung löschen?</AlertDialogTitle>
              <AlertDialogDescription>
                Diese Aktion kann nicht rückgängig gemacht werden. Die Bewertung wird dauerhaft gelöscht.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Löschen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Preview Dialog */}
        <AlertDialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Vorschau: Öffentliche Darstellung</AlertDialogTitle>
              <AlertDialogDescription>
                So wird die Bewertung auf der Website angezeigt:
              </AlertDialogDescription>
            </AlertDialogHeader>
            {selectedReview && (
              <div className="bg-white border rounded-lg p-4 my-4">
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= selectedReview.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                {selectedReview.text && (
                  <p className="text-gray-700 mb-3 whitespace-pre-wrap">{selectedReview.text}</p>
                )}
                <p className="text-sm text-gray-600 font-medium">
                  – {getAnonymizedName(selectedReview.name, selectedReview.anonymityLevel)}
                </p>
              </div>
            )}
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setPreviewDialogOpen(false)}>
                Schließen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
