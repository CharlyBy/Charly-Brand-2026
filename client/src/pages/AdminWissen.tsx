import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
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
import { Plus, MoreVertical, Pencil, Trash2, Eye, EyeOff, CheckCircle2, XCircle, RefreshCw, Brain, Check, X } from "lucide-react";
import { toast } from "sonner";
import AdminBreadcrumb from "../components/AdminBreadcrumb";

export default function AdminWissen() {
  const [, setLocation] = useLocation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<number | null>(null);
  const [deleteChunksDialogOpen, setDeleteChunksDialogOpen] = useState(false);
  const [articleToDeleteChunks, setArticleToDeleteChunks] = useState<number | null>(null);

  const { data: articles, isLoading, refetch } = trpc.knowledge.getAll.useQuery();
  const { data: toolsStatus, isLoading: toolsLoading, refetch: refetchTools } = trpc.system.checkTools.useQuery();
  const deleteMutation = trpc.knowledge.delete.useMutation();
  const publishMutation = trpc.knowledge.publish.useMutation();
  const unpublishMutation = trpc.knowledge.unpublish.useMutation();
  const installToolsMutation = trpc.system.installTools.useMutation();
  const processRAGMutation = trpc.rag.processArticle.useMutation();
  const deleteChunksMutation = trpc.rag.deleteChunks.useMutation();
  const regenerateChunksMutation = trpc.rag.regenerateChunks.useMutation();
  
  // Track processing state
  const [processingArticles, setProcessingArticles] = useState<Set<number>>(new Set());

  const handleInstallTools = async () => {
    try {
      toast.info('Installation gestartet... Dies kann 1-2 Minuten dauern.');
      const result = await installToolsMutation.mutateAsync();
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.warning(result.message);
      }
      
      refetchTools();
    } catch (error) {
      toast.error('Installation fehlgeschlagen. Bitte versuche es erneut.');
    }
  };

  const handleDelete = async () => {
    if (!articleToDelete) return;

    try {
      await deleteMutation.mutateAsync({ id: articleToDelete });
      toast.success("Artikel gelöscht");
      refetch();
      setDeleteDialogOpen(false);
      setArticleToDelete(null);
    } catch (error) {
      toast.error("Fehler beim Löschen");
    }
  };

  const handleTogglePublish = async (id: number, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await unpublishMutation.mutateAsync({ id });
        toast.success("Artikel als Entwurf gespeichert");
      } else {
        await publishMutation.mutateAsync({ id });
        toast.success("Artikel veröffentlicht");
      }
      refetch();
    } catch (error) {
      toast.error("Fehler beim Aktualisieren");
    }
  };

  const handleDeleteChunks = async () => {
    if (!articleToDeleteChunks) return;

    try {
      const result = await deleteChunksMutation.mutateAsync({ articleId: articleToDeleteChunks });
      toast.success(`${result.deletedCount} Chunks gelöscht`);
      refetch();
      setDeleteChunksDialogOpen(false);
      setArticleToDeleteChunks(null);
    } catch (error) {
      toast.error("Fehler beim Löschen der Chunks");
    }
  };

  const handleRegenerateChunks = async (articleId: number) => {
    setProcessingArticles(prev => new Set(prev).add(articleId));
    try {
      toast.info('RAG-Chunks werden neu generiert...');
      const result = await regenerateChunksMutation.mutateAsync({ articleId });
      toast.success(`${result.chunkCount} Chunks neu generiert`);
      refetch();
    } catch (error) {
      toast.error('Fehler beim Neu-Generieren der Chunks');
    } finally {
      setProcessingArticles(prev => {
        const next = new Set(prev);
        next.delete(articleId);
        return next;
      });
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      "körper-seele": "bg-green-100 text-green-800",
      "beziehungen": "bg-purple-100 text-purple-800",
      "angst-mut": "bg-orange-100 text-orange-800",
      "selbsterkenntnis": "bg-blue-100 text-blue-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      "körper-seele": "Körper & Seele",
      "beziehungen": "Beziehungen",
      "angst-mut": "Angst & Mut",
      "selbsterkenntnis": "Selbsterkenntnis",
    };
    return labels[category] || category;
  };

  return (
    <div className="container mx-auto py-8">
      <AdminBreadcrumb items={[{ label: "Wissens-Artikel" }]} />
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Wissens-Artikel</h1>
          <p className="text-muted-foreground mt-2">
            Verwalte deine PDF-Artikel und Präsentationen
          </p>
        </div>
        <Button
          onClick={() => setLocation("/admin/wissen/neu")}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Neuer Artikel
        </Button>
      </div>

      {/* System Tools Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">System-Tools Status</CardTitle>
          <CardDescription>
            PDF-Upload benötigt pdftoppm und cwebp
          </CardDescription>
        </CardHeader>
        <CardContent>
          {toolsLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Überprüfe System-Tools...
            </div>
          ) : toolsStatus?.available ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">System-Tools verfügbar</span>
              <Badge className="ml-2 bg-green-100 text-green-800">pdftoppm ✓</Badge>
              <Badge className="ml-1 bg-green-100 text-green-800">cwebp ✓</Badge>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="w-5 h-5" />
                <span className="font-medium">System-Tools fehlen</span>
                {!toolsStatus?.pdftoppm && <Badge variant="destructive" className="ml-2">pdftoppm ✗</Badge>}
                {!toolsStatus?.cwebp && <Badge variant="destructive" className="ml-1">cwebp ✗</Badge>}
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleInstallTools}
                  disabled={installToolsMutation.isPending}
                  variant="default"
                  size="sm"
                >
                  {installToolsMutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Installiere...
                    </>
                  ) : (
                    'Tools jetzt installieren'
                  )}
                </Button>
                <p className="text-sm text-muted-foreground">
                  Die Installation dauert ca. 1-2 Minuten
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alle Artikel</CardTitle>
          <CardDescription>
            {articles?.length || 0} Artikel insgesamt
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Lade Artikel...
            </div>
          ) : articles && articles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titel</TableHead>
                  <TableHead>Kategorie</TableHead>
                  <TableHead>Seiten</TableHead>
                  <TableHead>Lesezeit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>RAG</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">
                      {article.title}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={getCategoryBadgeColor(article.category)}
                      >
                        {getCategoryLabel(article.category)}
                      </Badge>
                    </TableCell>
                    <TableCell>{article.pageCount}</TableCell>
                    <TableCell>{article.readingTime} Min.</TableCell>
                    <TableCell>
                      {article.published ? (
                        <Badge className="bg-green-100 text-green-800">
                          Veröffentlicht
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Entwurf</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {article.chunkCount > 0 ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <Check className="w-4 h-4" />
                          <span className="text-xs">{article.chunkCount}</span>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          onClick={async () => {
                            setProcessingArticles(prev => new Set(prev).add(article.id));
                            try {
                              toast.info('RAG-Verarbeitung gestartet...');
                              const result = await processRAGMutation.mutateAsync({ articleId: article.id });
                              toast.success(`${result.chunkCount} Chunks erstellt`);
                              refetch();
                            } catch (error) {
                              toast.error('RAG-Verarbeitung fehlgeschlagen');
                            } finally {
                              setProcessingArticles(prev => {
                                const next = new Set(prev);
                                next.delete(article.id);
                                return next;
                              });
                            }
                          }}
                          disabled={processingArticles.has(article.id)}
                        >
                          {processingArticles.has(article.id) ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              setLocation(`/admin/wissen/${article.id}`)
                            }
                          >
                            <Pencil className="w-4 h-4 mr-2" />
                            Bearbeiten
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleTogglePublish(article.id, article.published ? true : false)
                            }
                          >
                            {article.published ? (
                              <>
                                <EyeOff className="w-4 h-4 mr-2" />
                                Als Entwurf speichern
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4 mr-2" />
                                Veröffentlichen
                              </>
                            )}
                          </DropdownMenuItem>
                           <DropdownMenuItem
                            onClick={async () => {
                              setProcessingArticles(prev => new Set(prev).add(article.id));
                              try {
                                toast.info('RAG-Verarbeitung gestartet...');
                                const result = await processRAGMutation.mutateAsync({ articleId: article.id });
                                toast.success(`${result.chunkCount} Chunks erstellt`);
                                refetch();
                              } catch (error) {
                                toast.error('RAG-Verarbeitung fehlgeschlagen');
                              } finally {
                                setProcessingArticles(prev => {
                                  const next = new Set(prev);
                                  next.delete(article.id);
                                  return next;
                                });
                              }
                            }}
                            disabled={processingArticles.has(article.id) || article.chunkCount > 0}
                          >
                            <Brain className="w-4 h-4 mr-2" />
                            {processingArticles.has(article.id) ? 'Verarbeite...' : 'RAG-Chunks generieren'}
                          </DropdownMenuItem>
                          {article.chunkCount > 0 && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleRegenerateChunks(article.id)}
                                disabled={processingArticles.has(article.id)}
                              >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Chunks neu generieren
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setArticleToDeleteChunks(article.id);
                                  setDeleteChunksDialogOpen(true);
                                }}
                                className="text-orange-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Chunks löschen
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem
                            onClick={() => {
                              setArticleToDelete(article.id);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Artikel löschen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Noch keine Artikel vorhanden
              </p>
              <Button
                onClick={() => setLocation("/admin/wissen/neu")}
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ersten Artikel erstellen
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Artikel löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Der Artikel und
              alle zugehörigen Dateien werden permanent gelöscht.
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

      <AlertDialog open={deleteChunksDialogOpen} onOpenChange={setDeleteChunksDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>RAG-Chunks löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion löscht alle RAG-Chunks dieses Artikels. Luna kann dann nicht mehr aus diesem Artikel lernen, bis die Chunks neu generiert werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteChunks}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Chunks löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
