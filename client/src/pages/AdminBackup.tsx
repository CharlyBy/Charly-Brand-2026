import { useState } from "react";
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
import { Download, Trash2, RotateCcw, Database, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import AdminBreadcrumb from "../components/AdminBreadcrumb";

export default function AdminBackup() {
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const { data: backups, isLoading, refetch } = trpc.backup.list.useQuery();
  const createMutation = trpc.backup.create.useMutation();
  const deleteMutation = trpc.backup.delete.useMutation();
  const restoreMutation = trpc.backup.restore.useMutation();

  const handleCreateBackup = async () => {
    setIsCreating(true);
    try {
      const backup = await createMutation.mutateAsync();
      toast.success("Backup erfolgreich erstellt!");
      refetch();
    } catch (error) {
      toast.error(
        `Backup fehlgeschlagen: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteBackup = async () => {
    if (!selectedBackup) return;

    try {
      await deleteMutation.mutateAsync({ backupId: selectedBackup.id });
      toast.success("Backup gelöscht");
      refetch();
      setDeleteDialogOpen(false);
      setSelectedBackup(null);
    } catch (error) {
      toast.error(
        `Löschen fehlgeschlagen: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`
      );
    }
  };

  const handleRestoreBackup = async () => {
    if (!selectedBackup) return;

    setIsRestoring(true);
    try {
      const result = await restoreMutation.mutateAsync({
        backupId: selectedBackup.id,
        s3Url: selectedBackup.s3Url,
      });

      if (result.success) {
        toast.success(
          `Wiederherstellung erfolgreich! ${result.totalRecords} Datensätze aus ${result.restoredTables.length} Tabellen wiederhergestellt.`,
          { duration: 8000 }
        );
        refetch();
      } else {
        toast.error(`Wiederherstellung fehlgeschlagen: ${result.errors.join(", ")}`);
      }

      setRestoreDialogOpen(false);
      setSelectedBackup(null);
    } catch (error) {
      toast.error(
        `Wiederherstellung fehlgeschlagen: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`
      );
    } finally {
      setIsRestoring(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("de-DE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) {
      return bytes + " Bytes";
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(2) + " KB";
    } else {
      return (bytes / 1024 / 1024).toFixed(2) + " MB";
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <AdminBreadcrumb items={[{ label: "Backup & Restore" }]} />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Backup & Wiederherstellung</h1>
        <p className="text-muted-foreground">
          Erstelle Backups deiner Datenbank und stelle sie bei Bedarf wieder her
        </p>
      </div>

      {/* Info Card */}
      <Card className="mb-6 border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <Database className="w-5 h-5" />
            Automatisches Backup
          </CardTitle>
          <CardDescription className="text-blue-700 dark:text-blue-300">
            Jeden Sonntag um 3 Uhr wird automatisch ein Backup erstellt. Du erhältst eine
            E-Mail-Benachrichtigung mit Download-Link. Backups werden 8 Wochen aufbewahrt.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Create Backup Button */}
      <div className="mb-6">
        <Button
          onClick={handleCreateBackup}
          disabled={isCreating}
          size="lg"
          className="gap-2"
        >
          {isCreating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Backup wird erstellt...
            </>
          ) : (
            <>
              <Database className="w-4 h-4" />
              Jetzt Backup erstellen
            </>
          )}
        </Button>
      </div>

      {/* Backups Table */}
      <Card>
        <CardHeader>
          <CardTitle>Verfügbare Backups</CardTitle>
          <CardDescription>
            {backups?.length || 0} Backup{backups?.length !== 1 ? "s" : ""} verfügbar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!backups || backups.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Noch keine Backups vorhanden</p>
              <p className="text-sm mt-2">
                Erstelle dein erstes Backup mit dem Button oben
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Datum</TableHead>
                    <TableHead>Größe</TableHead>
                    <TableHead>Tabellen</TableHead>
                    <TableHead>Dateien</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backups.map((backup: any) => (
                    <TableRow key={backup.id}>
                      <TableCell className="font-medium">
                        {formatDate(backup.createdAt)}
                      </TableCell>
                      <TableCell>{formatSize(backup.size)}</TableCell>
                      <TableCell>{backup.tables.length}</TableCell>
                      <TableCell>{backup.fileCount}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(backup.s3Url, "_blank")}
                            className="gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedBackup(backup);
                              setRestoreDialogOpen(true);
                            }}
                            className="gap-2"
                          >
                            <RotateCcw className="w-4 h-4" />
                            Wiederherstellen
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedBackup(backup);
                              setDeleteDialogOpen(true);
                            }}
                            className="gap-2 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                            Löschen
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Backup wiederherstellen?
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-3 mt-2">
                <p className="font-semibold">
                  ⚠️ WARNUNG: Diese Aktion kann nicht rückgängig gemacht werden!
                </p>
                <p>
                  Alle aktuellen Daten werden gelöscht und durch das Backup vom{" "}
                  <strong>{selectedBackup && formatDate(selectedBackup.createdAt)}</strong>{" "}
                  ersetzt.
                </p>
                <p className="text-sm">
                  Betroffene Tabellen: Konversationen, Nachrichten, Statistiken,
                  Enneagramm-Analysen, Wissens-Artikel, Abonnements
                </p>
                <p className="text-sm font-semibold">
                  Die Benutzer-Tabelle bleibt unverändert (Admin-Zugang bleibt erhalten).
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRestoring}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestoreBackup}
              disabled={isRestoring}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isRestoring ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Wird wiederhergestellt...
                </>
              ) : (
                "Ja, jetzt wiederherstellen"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Backup löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du das Backup vom{" "}
              <strong>{selectedBackup && formatDate(selectedBackup.createdAt)}</strong>{" "}
              wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBackup}
              className="bg-destructive hover:bg-destructive/90"
            >
              Ja, löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
