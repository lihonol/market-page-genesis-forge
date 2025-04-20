
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFolderTextFiles } from "@/hooks/useFolderTextFiles";

const FIXED_LABELS = [
  "Ip Address",
  "Country",
  "Platform",
  "Batterypercentage",
  "NetworkInformation",
  "DeviceLocalTime",
  "UserAgent",
  "ReferUrl",
];

export default function Database() {
  const { files, loading } = useFolderTextFiles();

  // هر فایل را به ابجکت مناسب برای دسترسی آسان به کلید و مقدار تبدیل می‌کنیم
  const getRowObj = (rows: { label: string; value: string }[]) => {
    const obj: Record<string, string> = {};
    rows.forEach(({ label, value }) => {
      obj[label] = value;
    });
    return obj;
  };

  return (
    <div className="max-w-6xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Text Files Database Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded border bg-background">
            <table className="w-full min-w-max border-collapse">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2 whitespace-nowrap text-left font-semibold text-sm">File Name</th>
                  {FIXED_LABELS.map((label) => (
                    <th key={label} className="px-4 py-2 whitespace-nowrap text-left font-semibold text-sm">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={FIXED_LABELS.length + 1} className="text-center py-8">
                      در حال خواندن فایل‌ها...
                    </td>
                  </tr>
                ) : files.length === 0 ? (
                  <tr>
                    <td colSpan={FIXED_LABELS.length + 1} className="text-center py-8">
                      هیچ فایل متنی پیدا نشد.
                    </td>
                  </tr>
                ) : (
                  files.map((file) => {
                    const rowObj = getRowObj(file.rows);
                    return (
                      <tr key={file.fileName} className="border-b last:border-b-0">
                        <td className="px-4 py-2 font-mono text-sm whitespace-nowrap">{file.fileName}</td>
                        {FIXED_LABELS.map((label) => (
                          <td key={label} className="px-4 py-2 text-xs whitespace-pre-wrap break-all">
                            {rowObj[label] || ""}
                          </td>
                        ))}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
