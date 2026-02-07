import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, MessageSquare, TrendingUp, Users, MoreVertical, Trash2, FileDown, Printer, Search, Filter, Brain, BookOpen, Database, BarChart3, Star } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Streamdown } from "streamdown";

export default function Admin() {
  const { user, loading } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  
  // Filter and search state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "emergency" | "normal">("all");
  const [outcomeFilter, setOutcomeFilter] = useState<string>("all");

  // Fetch all conversations
  const { data: conversations, isLoading: conversationsLoading } =
    trpc.luna.getAllConversations.useQuery();

  // Filter conversations based on search and filters
  const filteredConversations = useMemo(() => {
    if (!conversations) return [];

    return conversations.filter((conv) => {
      // Search filter (email, name, or ID)
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        conv.id.toLowerCase().includes(searchLower) ||
        conv.email?.toLowerCase().includes(searchLower) ||
        conv.firstName?.toLowerCase().includes(searchLower);

      // Status filter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "emergency" && conv.emergencyFlag === 1) ||
        (statusFilter === "normal" && conv.emergencyFlag !== 1);

      // Outcome filter
      const matchesOutcome =
        outcomeFilter === "all" ||
        (outcomeFilter === "none" && !conv.outcome) ||
        conv.outcome === outcomeFilter;

      return matchesSearch && matchesStatus && matchesOutcome;
    });
  }, [conversations, searchQuery, statusFilter, outcomeFilter]);

  // Get unique outcomes for filter dropdown
  const uniqueOutcomes = useMemo(() => {
    if (!conversations) return [];
    const outcomes = conversations
      .map((c) => c.outcome)
      .filter((o) => o !== null && o !== undefined) as string[];
    return Array.from(new Set(outcomes));
  }, [conversations]);

  // Fetch stats
  const { data: stats } = trpc.luna.getStats.useQuery();

  // Fetch selected conversation details
  const { data: conversationDetails } = trpc.luna.getConversationDetails.useQuery(
    { conversationId: selectedConversationId! },
    { enabled: !!selectedConversationId }
  );

  // Delete mutation
  const utils = trpc.useUtils();
  const deleteMutation = trpc.luna.deleteConversation.useMutation({
    onSuccess: () => {
      utils.luna.getAllConversations.invalidate();
      utils.luna.getStats.invalidate();
      setDeleteDialogOpen(false);
      setConversationToDelete(null);
    },
  });

  const handleDelete = (conversationId: string) => {
    setConversationToDelete(conversationId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (conversationToDelete) {
      deleteMutation.mutate({ conversationId: conversationToDelete });
    }
  };

  const handleExportPDF = async (conversationId: string) => {
    // Fetch conversation details
    const conv = conversations?.find(c => c.id === conversationId);
    if (!conv) return;

    // Fetch full conversation details with messages
    const details = await utils.luna.getConversationDetails.fetch({ conversationId });
    if (!details) return;

    // Create printable HTML content
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Konversation ${conversationId}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
          h1 { color: #9c27b0; border-bottom: 2px solid #9c27b0; padding-bottom: 10px; }
          .info { background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .info-row { display: flex; justify-content: space-between; margin: 8px 0; }
          .label { font-weight: bold; color: #666; }
          .message { margin: 15px 0; padding: 15px; border-radius: 8px; }
          .user { background: #9c27b0; color: white; margin-left: 20%; }
          .luna { background: #f0f0f0; margin-right: 20%; }
          .sender { font-size: 12px; opacity: 0.8; margin-bottom: 5px; }
          .emergency { background: #fee; border: 2px solid #f00; padding: 10px; margin: 20px 0; color: #c00; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>Gesprächsprotokoll</h1>
        <div class="info">
          <div class="info-row"><span class="label">Konversations-ID:</span><span>${details.id}</span></div>
          <div class="info-row"><span class="label">Email:</span><span>${details.email || '-'}</span></div>
          <div class="info-row"><span class="label">Name:</span><span>${details.firstName || '-'}</span></div>
          <div class="info-row"><span class="label">Datum:</span><span>${new Date(details.startedAt).toLocaleString('de-DE')}</span></div>
          <div class="info-row"><span class="label">Empfehlung:</span><span>${details.outcome || '-'}</span></div>
        </div>
        ${details.emergencyFlag ? '<div class="emergency">⚠️ NOTFALL - Suizidgedanken erkannt</div>' : ''}
        <h2>Gesprächsverlauf</h2>
        ${details.messages.map(msg => `
          <div class="message ${msg.sender}">
            <div class="sender">${msg.sender === 'user' ? 'User' : 'Luna'} • ${new Date(msg.timestamp).toLocaleTimeString('de-DE')}</div>
            <div>${msg.content.replace(/\n/g, '<br>')}</div>
          </div>
        `).join('')}
      </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `konversation_${conversationId}_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = async (conversationId: string) => {
    // Fetch conversation details
    const details = await utils.luna.getConversationDetails.fetch({ conversationId });
    if (!details) return;

    // Create printable HTML content (same as PDF)
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Konversation ${conversationId}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
          h1 { color: #9c27b0; border-bottom: 2px solid #9c27b0; padding-bottom: 10px; }
          .info { background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .info-row { display: flex; justify-content: space-between; margin: 8px 0; }
          .label { font-weight: bold; color: #666; }
          .message { margin: 15px 0; padding: 15px; border-radius: 8px; page-break-inside: avoid; }
          .user { background: #9c27b0; color: white; margin-left: 20%; }
          .luna { background: #f0f0f0; margin-right: 20%; }
          .sender { font-size: 12px; opacity: 0.8; margin-bottom: 5px; }
          .emergency { background: #fee; border: 2px solid #f00; padding: 10px; margin: 20px 0; color: #c00; font-weight: bold; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <h1>Gesprächsprotokoll</h1>
        <div class="info">
          <div class="info-row"><span class="label">Konversations-ID:</span><span>${details.id}</span></div>
          <div class="info-row"><span class="label">Email:</span><span>${details.email || '-'}</span></div>
          <div class="info-row"><span class="label">Name:</span><span>${details.firstName || '-'}</span></div>
          <div class="info-row"><span class="label">Datum:</span><span>${new Date(details.startedAt).toLocaleString('de-DE')}</span></div>
          <div class="info-row"><span class="label">Empfehlung:</span><span>${details.outcome || '-'}</span></div>
        </div>
        ${details.emergencyFlag ? '<div class="emergency">⚠️ NOTFALL - Suizidgedanken erkannt</div>' : ''}
        <h2>Gesprächsverlauf</h2>
        ${details.messages.map(msg => `
          <div class="message ${msg.sender}">
            <div class="sender">${msg.sender === 'user' ? 'User' : 'Luna'} • ${new Date(msg.timestamp).toLocaleTimeString('de-DE')}</div>
            <div>${msg.content.replace(/\n/g, '<br>')}</div>
          </div>
        `).join('')}
      </body>
      </html>
    `;

    // Open in new window and trigger print
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Lade...</p>
      </div>
    );
  }

  // Check if user is admin (owner)
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-4">Zugriff verweigert</h2>
            <p className="text-muted-foreground mb-4">
              Du hast keine Berechtigung, auf das Admin-Dashboard zuzugreifen.
            </p>
            <Link href="/">
              <Button>Zur Startseite</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Luna Gespräche & Statistiken</p>
            </div>
            <Link href="/">
              <Button variant="outline">Zur Website</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Gespräche gesamt</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalConversations || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Notfälle</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {stats?.emergencyCount || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.uniqueUsers || 0}</div>
            </CardContent>
          </Card>

          <Link href="/admin/enneagram-analyses">
            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Enneagramm-Analysen</CardTitle>
                <Brain className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">→</div>
                <p className="text-xs text-muted-foreground mt-1">Alle Tests ansehen</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/bewertungen">
            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Bewertungen</CardTitle>
                <Star className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">→</div>
                <p className="text-xs text-muted-foreground mt-1">Klienten-Feedback verwalten</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/wissen">
            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Wissens-Artikel</CardTitle>
                <BookOpen className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">→</div>
                <p className="text-xs text-muted-foreground mt-1">PDF-Artikel verwalten</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/backup">
            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Backup & Restore</CardTitle>
                <Database className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">→</div>
                <p className="text-xs text-muted-foreground mt-1">Datenbank sichern & wiederherstellen</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/analytics">
            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Analytics & Statistiken</CardTitle>
                <BarChart3 className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">→</div>
                <p className="text-xs text-muted-foreground mt-1">Verweildauer, Scroll-Tiefe & Engagement</p>
              </CardContent>
            </Card>
          </Link>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.conversionRate ? `${stats.conversionRate.toFixed(1)}%` : "0%"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conversations Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Alle Gespräche</span>
              <span className="text-sm font-normal text-muted-foreground">
                {filteredConversations.length} von {conversations?.length || 0}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Search and Filter Bar */}
            <div className="mb-6 space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Suche nach Email, Name oder ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                {/* Status Filter */}
                <div className="flex gap-2">
                  <Button
                    variant={statusFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("all")}
                  >
                    Alle
                  </Button>
                  <Button
                    variant={statusFilter === "emergency" ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("emergency")}
                    className="gap-1"
                  >
                    <AlertTriangle className="h-3 w-3" />
                    Notfälle
                  </Button>
                  <Button
                    variant={statusFilter === "normal" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("normal")}
                  >
                    Normal
                  </Button>
                </div>

                {/* Outcome Filter */}
                <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
                  <SelectTrigger className="w-[180px] h-9">
                    <SelectValue placeholder="Empfehlung" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Empfehlungen</SelectItem>
                    <SelectItem value="none">Keine Empfehlung</SelectItem>
                    {uniqueOutcomes.map((outcome) => (
                      <SelectItem key={outcome} value={outcome}>
                        {outcome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Clear Filters */}
                {(searchQuery || statusFilter !== "all" || outcomeFilter !== "all") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("all");
                      setOutcomeFilter("all");
                    }}
                  >
                    Filter zurücksetzen
                  </Button>
                )}
              </div>
            </div>

            {conversationsLoading ? (
              <p>Lade Gespräche...</p>
            ) : !conversations || conversations.length === 0 ? (
              <p className="text-muted-foreground">Noch keine Gespräche vorhanden.</p>
            ) : filteredConversations.length === 0 ? (
              <p className="text-muted-foreground">Keine Gespräche gefunden. Versuchen Sie andere Filter.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Nachrichten</TableHead>
                    <TableHead>Empfehlung</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Erstellt</TableHead>
                    <TableHead>Aktion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConversations.map((conv) => (
                    <TableRow key={conv.id}>
                      <TableCell className="font-mono text-sm">{conv.id}</TableCell>
                      <TableCell>{conv.email || "-"}</TableCell>
                      <TableCell>{conv.firstName || "-"}</TableCell>
                      <TableCell>{conv.messageCount}</TableCell>
                      <TableCell>
                        {conv.outcome ? (
                          <Badge variant="secondary">{conv.outcome}</Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {conv.emergencyFlag ? (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Notfall
                          </Badge>
                        ) : (
                          <Badge variant="outline">Normal</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(conv.startedAt).toLocaleDateString("de-DE", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedConversationId(conv.id)}
                          >
                            Details
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleExportPDF(conv.id)}>
                                <FileDown className="mr-2 h-4 w-4" />
                                Als PDF exportieren
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePrint(conv.id)}>
                                <Printer className="mr-2 h-4 w-4" />
                                Drucken
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(conv.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Löschen
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Conversation Details Dialog */}
      <Dialog
        open={!!selectedConversationId}
        onOpenChange={(open) => !open && setSelectedConversationId(null)}
      >
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gesprächsdetails #{selectedConversationId}</DialogTitle>
          </DialogHeader>

          {conversationDetails && (
            <div className="space-y-4">
              {/* User Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">User-Informationen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{conversationDetails.email || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{conversationDetails.firstName || "-"}</span>
                  </div>
                  {conversationDetails.enneagramType && (
                    <div className="mt-4 p-4 rounded-lg border-2 border-primary/20 bg-primary/5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-3xl">
                          {(() => {
                            const typeNum = conversationDetails.enneagramType?.match(/^(\d)/)?.[1];
                            const icons: Record<string, string> = {
                              "1": "⚖️", "2": "❤️", "3": "🏆", "4": "🎨",
                              "5": "🔍", "6": "🛡️", "7": "✨", "8": "💪", "9": "☮️"
                            };
                            return typeNum ? icons[typeNum] : "🧠";
                          })()}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-lg">
                            {(() => {
                              const typeNum = conversationDetails.enneagramType?.match(/^(\d)/)?.[1];
                              const names: Record<string, string> = {
                                "1": "Der Perfektionist", "2": "Der Helfer", "3": "Der Erfolgsmensch",
                                "4": "Der Individualist", "5": "Der Beobachter", "6": "Der Loyalist",
                                "7": "Der Enthusiast", "8": "Der Herausforderer", "9": "Der Friedensstifter"
                              };
                              return typeNum ? `Typ ${conversationDetails.enneagramType} - ${names[typeNum]}` : conversationDetails.enneagramType;
                            })()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {(() => {
                              const wing = conversationDetails.enneagramType?.match(/w(\d)/)?.[0];
                              if (!wing) return null;
                              const wingDescriptions: Record<string, Record<string, string>> = {
                                "1": { "w9": "mit Friedensstifter-Flügel", "w2": "mit Helfer-Flügel" },
                                "2": { "w1": "mit Perfektionisten-Flügel", "w3": "mit Erfolgsmensch-Flügel" },
                                "3": { "w2": "mit Helfer-Flügel", "w4": "mit Individualist-Flügel" },
                                "4": { "w3": "mit Erfolgsmensch-Flügel", "w5": "mit Beobachter-Flügel" },
                                "5": { "w4": "mit Individualist-Flügel", "w6": "mit Loyalist-Flügel" },
                                "6": { "w5": "mit Beobachter-Flügel", "w7": "mit Enthusiast-Flügel" },
                                "7": { "w6": "mit Loyalist-Flügel", "w8": "mit Herausforderer-Flügel" },
                                "8": { "w7": "mit Enthusiast-Flügel", "w9": "mit Friedensstifter-Flügel" },
                                "9": { "w8": "mit Herausforderer-Flügel", "w1": "mit Perfektionisten-Flügel" }
                              };
                              const typeNum = conversationDetails.enneagramType?.match(/^(\d)/)?.[1];
                              return typeNum && wingDescriptions[typeNum]?.[wing] ? wingDescriptions[typeNum][wing] : null;
                            })()}
                          </div>
                        </div>
                      </div>
                      
                      {/* Confidence Score */}
                      {conversationDetails.enneagramConfidence !== null && conversationDetails.enneagramConfidence !== undefined && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Zuverlässigkeit:</span>
                            <span className="font-medium">
                              {Math.round(conversationDetails.enneagramConfidence * 100)}% 
                              {(() => {
                                const pct = Math.round(conversationDetails.enneagramConfidence * 100);
                                if (pct >= 80) return "(Sehr hoch)";
                                if (pct >= 60) return "(Hoch)";
                                if (pct >= 40) return "(Mittel)";
                                if (pct >= 20) return "(Niedrig)";
                                return "(Sehr niedrig)";
                              })()}
                            </span>
                          </div>
                          <div className="w-full bg-secondary/30 rounded-full h-3 overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.round(conversationDetails.enneagramConfidence * 100)}%`,
                                backgroundColor: (() => {
                                  const pct = Math.round(conversationDetails.enneagramConfidence * 100);
                                  if (pct >= 80) return "oklch(0.6 0.2 140)"; // Grün
                                  if (pct >= 60) return "oklch(0.65 0.2 110)"; // Gelb-Grün
                                  if (pct >= 40) return "oklch(0.7 0.2 80)"; // Gelb
                                  if (pct >= 20) return "oklch(0.65 0.2 40)"; // Orange
                                  return "oklch(0.55 0.2 20)"; // Rot
                                })()
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {!conversationDetails.enneagramType && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Enneagramm-Typ:</span>
                      <span className="font-medium">-</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hauptthema:</span>
                    <span className="font-medium">{conversationDetails.mainTopic || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Empfehlung:</span>
                    <span className="font-medium">
                      {conversationDetails.outcome || "-"}
                    </span>
                  </div>
                  {conversationDetails.emergencyFlag === 1 && (
                    <div className="flex items-center gap-2 text-destructive font-semibold">
                      <AlertTriangle className="h-4 w-4" />
                      NOTFALL - Suizidgedanken erkannt
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Messages */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Gesprächsverlauf</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {conversationDetails.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          msg.sender === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                        >
                          <div className="text-xs opacity-70 mb-1">
                            {msg.sender === "user" ? "User" : "Luna"} •{" "}
                            {new Date(msg.timestamp).toLocaleTimeString("de-DE", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <Streamdown>{msg.content}</Streamdown>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konversation löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie diese Konversation löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
