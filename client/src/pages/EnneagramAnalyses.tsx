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
import { trpc } from "@/lib/trpc";
import { Brain, Search, FileDown, Eye } from "lucide-react";
import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Streamdown } from "streamdown";
import { toast } from "sonner";

export default function EnneagramAnalyses() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<number | null>(null);

  // Fetch all analyses
  const { data: analyses, isLoading, refetch } = trpc.enneagram.getAllAnalyses.useQuery();

  // Fetch selected analysis details
  const { data: selectedAnalysis } = trpc.enneagram.getAnalysisById.useQuery(
    { id: selectedAnalysisId! },
    { enabled: selectedAnalysisId !== null }
  );

  // Filter analyses based on search
  const filteredAnalyses = useMemo(() => {
    if (!analyses) return [];
    if (!searchTerm) return analyses;

    const term = searchTerm.toLowerCase();
    return analyses.filter(
      (analysis) =>
        analysis.userName.toLowerCase().includes(term) ||
        analysis.userEmail.toLowerCase().includes(term) ||
        `typ ${analysis.primaryType}`.includes(term)
    );
  }, [analyses, searchTerm]);

  // Redirect if not admin
  if (!loading && user?.role !== 'admin') {
    setLocation('/');
    return null;
  }

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-500";
    if (confidence >= 0.6) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return "Hoch";
    if (confidence >= 0.6) return "Mittel";
    return "Niedrig";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="container max-w-7xl py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Enneagramm-Analysen</h1>
            <p className="text-gray-600">Übersicht aller durchgeführten Persönlichkeitstests</p>
          </div>
          <Link href="/admin">
            <Button variant="outline">
              Zurück zum Dashboard
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Gesamt Analysen
              </CardTitle>
              <Brain className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyses?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Durchschnittliche Confidence
              </CardTitle>
              <Brain className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyses && analyses.length > 0
                  ? `${Math.round((analyses.reduce((sum, a) => sum + a.confidence, 0) / analyses.length) * 100)}%`
                  : "0%"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Häufigster Typ
              </CardTitle>
              <Brain className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyses && analyses.length > 0
                  ? `Typ ${
                      Object.entries(
                        analyses.reduce((acc, a) => {
                          acc[a.primaryType] = (acc[a.primaryType] || 0) + 1;
                          return acc;
                        }, {} as Record<number, number>)
                      ).sort((a, b) => b[1] - a[1])[0][0]
                    }`
                  : "N/A"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Suche nach Name, E-Mail oder Typ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analyses Table */}
        <Card>
          <CardHeader>
            <CardTitle>Alle Analysen ({filteredAnalyses.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredAnalyses.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Keine Analysen gefunden</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>E-Mail</TableHead>
                      <TableHead>Typ</TableHead>
                      <TableHead>Flügel</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Datum</TableHead>
                      <TableHead>Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAnalyses.map((analysis) => (
                      <TableRow key={analysis.id}>
                        <TableCell className="font-medium">{analysis.userName}</TableCell>
                        <TableCell>{analysis.userEmail}</TableCell>
                        <TableCell>
                          <Badge variant="outline">Typ {analysis.primaryType}</Badge>
                        </TableCell>
                        <TableCell>
                          {analysis.wing ? (
                            <Badge variant="secondary">{analysis.wing}</Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getConfidenceColor(analysis.confidence)}`} />
                            <span className="text-sm">
                              {Math.round(analysis.confidence * 100)}% ({getConfidenceLabel(analysis.confidence)})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(analysis.createdAt).toLocaleDateString('de-DE', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedAnalysisId(analysis.id)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ansehen
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analysis Details Dialog */}
      <Dialog open={selectedAnalysisId !== null} onOpenChange={() => setSelectedAnalysisId(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Analyse-Details</DialogTitle>
          </DialogHeader>
          {selectedAnalysis && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{selectedAnalysis.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">E-Mail</p>
                  <p className="font-medium">{selectedAnalysis.userEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Typ</p>
                  <p className="font-medium">Typ {selectedAnalysis.primaryType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Flügel</p>
                  <p className="font-medium">{selectedAnalysis.wing || "Kein Flügel"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Confidence</p>
                  <p className="font-medium">{Math.round(selectedAnalysis.confidence * 100)}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Datum</p>
                  <p className="font-medium">
                    {new Date(selectedAnalysis.createdAt).toLocaleDateString('de-DE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {/* Analysis Content */}
              <div className="prose prose-sm max-w-none">
                <Streamdown>
                  {JSON.parse(selectedAnalysis.analysisJson).fullAnalysis || "Keine Analyse verfügbar"}
                </Streamdown>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
