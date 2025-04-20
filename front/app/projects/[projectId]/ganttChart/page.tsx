"use client";
import { Suspense } from "react";
import GanttChartClient from "./GanttChartClient";


export default function GanttChartPage() {


  return (
    <Suspense fallback={<div className="flex justify-center items-center h-[400px]">ロード中...</div>}>
      <GanttChartClient />
    </Suspense>
  );
} 