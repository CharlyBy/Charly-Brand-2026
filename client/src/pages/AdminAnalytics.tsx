import { useState } from "react";
import { trpc } from "../lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { BarChart3, TrendingUp, Eye, Clock, MousePointer, Download } from "lucide-react";
import AdminBreadcrumb from "../components/AdminBreadcrumb";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState("30");

  const { data: summary, isLoading: summaryLoading } = trpc.analytics.getSummary.useQuery();
  const { data: topArticles, isLoading: topLoading } = trpc.analytics.getTopArticles.useQuery({
    limit: 10,
  });
  const { data: trends, isLoading: trendsLoading } = trpc.analytics.getEngagementTrends.useQuery({
    days: parseInt(timeRange),
  });

  if (summaryLoading || topLoading || trendsLoading) {
    return (
      <div className="container mx-auto py-8 max-w-7xl">
        <AdminBreadcrumb items={[{ label: "Analytics" }]} />
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lade Statistiken...</p>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getEngagementColor = (score: number) => {
    if (score >= 70) return "bg-green-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getEngagementLabel = (score: number) => {
    if (score >= 70) return "Hoch";
    if (score >= 40) return "Mittel";
    return "Niedrig";
  };

  // Export to CSV
  const exportToCSV = () => {
    if (!topArticles) return;

    const headers = ["Titel", "Kategorie", "Aufrufe", "Ø Verweildauer (s)", "Ø Scroll-Tiefe (%)", "Bounce-Rate (%)", "Engagement-Score"];
    const rows = topArticles.map((article) => [
      article.title,
      article.category,
      article.totalViews,
      article.avgTimeSpent,
      article.avgScrollDepth,
      article.bounceRate,
      article.engagementScore,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `analytics_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <AdminBreadcrumb items={[{ label: "Analytics" }]} />

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics & Statistiken</h1>
            <p className="text-muted-foreground">
              Verweildauer, Scroll-Tiefe und Engagement-Metriken für Wissens-Artikel
            </p>
          </div>
          <Button onClick={exportToCSV} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            CSV Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt-Aufrufe</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalViews || 0}</div>
            <p className="text-xs text-muted-foreground">
              {summary?.activeArticles || 0} von {summary?.totalArticles || 0} Artikeln aktiv
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ø Verweildauer</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(summary?.avgTimeSpent || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Pro Artikel-Aufruf
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ø Scroll-Tiefe</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.avgScrollDepth || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Durchschnittlich gelesen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {topArticles && topArticles.length > 0
                ? Math.round(
                    topArticles.reduce((sum, a) => sum + a.engagementScore, 0) /
                      topArticles.length
                  )
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Durchschnittlicher Score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trends Chart */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Engagement-Trends</CardTitle>
              <CardDescription>
                Aufrufe und Engagement über Zeit
              </CardDescription>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Letzte 7 Tage</SelectItem>
                <SelectItem value="30">Letzte 30 Tage</SelectItem>
                <SelectItem value="90">Letzte 90 Tage</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {trends && trends.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => new Date(value).toLocaleDateString("de-DE", { month: "short", day: "numeric" })}
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleDateString("de-DE")}
                  formatter={(value: number, name: string) => {
                    if (name === "Aufrufe") return [value, name];
                    if (name === "Ø Verweildauer") return [formatTime(value), name];
                    if (name === "Ø Scroll-Tiefe") return [`${value}%`, name];
                    return [value, name];
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="views"
                  stroke="#8884d8"
                  name="Aufrufe"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgScrollDepth"
                  stroke="#82ca9d"
                  name="Ø Scroll-Tiefe"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Noch keine Daten verfügbar
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Articles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top-Artikel nach Engagement</CardTitle>
          <CardDescription>
            Ranking basierend auf Verweildauer, Scroll-Tiefe und Bounce-Rate
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topArticles && topArticles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Titel</TableHead>
                  <TableHead>Kategorie</TableHead>
                  <TableHead className="text-right">Aufrufe</TableHead>
                  <TableHead className="text-right">Ø Verweildauer</TableHead>
                  <TableHead className="text-right">Ø Scroll-Tiefe</TableHead>
                  <TableHead className="text-right">Bounce-Rate</TableHead>
                  <TableHead className="text-right">Engagement</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topArticles.map((article, index) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="font-medium">{article.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{article.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{article.totalViews}</TableCell>
                    <TableCell className="text-right">{formatTime(article.avgTimeSpent)}</TableCell>
                    <TableCell className="text-right">{article.avgScrollDepth}%</TableCell>
                    <TableCell className="text-right">{article.bounceRate}%</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className={`w-2 h-2 rounded-full ${getEngagementColor(article.engagementScore)}`} />
                        <span className="font-medium">{article.engagementScore}</span>
                        <span className="text-xs text-muted-foreground">
                          ({getEngagementLabel(article.engagementScore)})
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Noch keine Artikel-Aufrufe vorhanden
            </div>
          )}
        </CardContent>
      </Card>

      {/* Device Breakdown (if needed later) */}
      {topArticles && topArticles.length > 0 && topArticles[0].deviceBreakdown && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Geräte-Verteilung</CardTitle>
            <CardDescription>
              Aufrufe nach Geräte-Typ (Top-Artikel)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={[
                  {
                    name: "Desktop",
                    value: topArticles[0].deviceBreakdown.desktop,
                  },
                  {
                    name: "Mobile",
                    value: topArticles[0].deviceBreakdown.mobile,
                  },
                  {
                    name: "Tablet",
                    value: topArticles[0].deviceBreakdown.tablet,
                  },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
