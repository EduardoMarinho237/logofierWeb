"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Stage, Layer, Image as KonvaImage, Transformer } from "react-konva";
import { RotateCcw } from "lucide-react";
import type Konva from "konva";
import type { Position } from "@/lib/api";

interface Props {
  previewImage: string;
  pageWidthPoints: number;
  pageHeightPoints: number;
  logoUrl: string;
  position: Position;
  onChange: (p: Position) => void;
  onResetProportion?: () => void;
  preserveAspect?: boolean;
}

const PADDING = 20;

export default function KonvaStage({
  previewImage,
  pageWidthPoints,
  pageHeightPoints,
  logoUrl,
  position,
  onChange,
  onResetProportion,
  preserveAspect = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [pageImg, setPageImg] = useState<HTMLImageElement | null>(null);
  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null);
  const [logoAspect, setLogoAspect] = useState(1);

  const logoRef = useRef<Konva.Image>(null);
  const trRef = useRef<Konva.Transformer>(null);

  // Mede o container para encaixar a página sem rolagem (responsivo).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() =>
      setBox({ w: el.clientWidth, h: el.clientHeight })
    );
    ro.observe(el);
    setBox({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!previewImage) return;
    const img = new window.Image();
    img.onload = () => setPageImg(img);
    img.src = previewImage;
  }, [previewImage]);

  useEffect(() => {
    if (!logoUrl) return;
    const img = new window.Image();
    img.onload = () => {
      setLogoImg(img);
      if (img.naturalWidth && img.naturalHeight)
        setLogoAspect(img.naturalWidth / img.naturalHeight);
    };
    img.src = logoUrl;
  }, [logoUrl]);

  // Encaixa a página (coordenadas de pontos) dentro do container, escala uniforme.
  const fit = useMemo(() => {
    const availW = Math.max(1, box.w - PADDING * 2);
    const availH = Math.max(1, box.h - PADDING * 2);
    const s = Math.min(availW / pageWidthPoints, availH / pageHeightPoints);
    return {
      scale: s,
      w: Math.max(1, pageWidthPoints * s),
      h: Math.max(1, pageHeightPoints * s),
    };
  }, [box.w, box.h, pageWidthPoints, pageHeightPoints]);

  // Página: desenhada no seu aspecto real (sem distorção) e centralizada no
  // espaço de pontos. Quando o aspecto da imagem == aspecto da página (caso
  // normal do backend), ela preenche exatamente a caixa — alinhamento perfeito.
  const imgScale = pageImg
    ? Math.min(
        pageWidthPoints / (pageImg.naturalWidth || 1),
        pageHeightPoints / (pageImg.naturalHeight || 1)
      )
    : 0;
  const imgDrawW = pageImg ? pageImg.naturalWidth * imgScale : pageWidthPoints;
  const imgDrawH = pageImg ? pageImg.naturalHeight * imgScale : pageHeightPoints;
  const imgX = (pageWidthPoints - imgDrawW) / 2;
  const imgY = (pageHeightPoints - imgDrawH) / 2;

  // Logo: width and height are independent so the user may freely distort it.
  const widthPt = Math.max(1, position.width);
  const heightPt = preserveAspect
    ? Math.max(1, position.width / logoAspect)
    : Math.max(1, position.height);

  const expectedH = widthPt / logoAspect;
  const isDistorted = !preserveAspect && Math.abs(heightPt - expectedH) > Math.max(1, expectedH * 0.01);

  // Limita o logo dentro da página.
  const xPt = clamp(position.x, 0, Math.max(0, pageWidthPoints - widthPt));
  const yPt = clamp(position.y, 0, Math.max(0, pageHeightPoints - heightPt));

  useEffect(() => {
    if (logoRef.current && trRef.current) {
      trRef.current.nodes([logoRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [logoImg, logoAspect]);

  function commit(x: number, y: number, w: number, h: number) {
    onChange({
      ...position,
      x,
      y,
      width: w,
      height: preserveAspect ? w / logoAspect : h,
    });
  }

  return (
    <div
      ref={containerRef}
      className="relative flex w-full items-center justify-center overflow-hidden"
      style={{ height: "100%", minHeight: 320 }}
    >
      {box.w > 0 && (
        <Stage
          width={fit.w}
          height={fit.h}
          scale={{ x: fit.scale, y: fit.scale }}
          style={{ cursor: logoImg ? "move" : "default" }}
        >
          <Layer>
            {pageImg && (
              <KonvaImage
                image={pageImg}
                x={imgX}
                y={imgY}
                width={imgDrawW}
                height={imgDrawH}
              />
            )}
            {logoImg && (
              <KonvaImage
                ref={logoRef}
                image={logoImg}
                x={xPt}
                y={yPt}
                width={widthPt}
                height={heightPt}
                draggable
                onMouseEnter={(e) => {
                  const c = e.target.getStage()?.container();
                  if (c) c.style.cursor = "move";
                }}
                onMouseLeave={(e) => {
                  const c = e.target.getStage()?.container();
                  if (c) c.style.cursor = "default";
                }}
                onDragMove={(e) =>
                  commit(
                    clamp(e.target.x(), 0, pageWidthPoints - widthPt),
                    clamp(e.target.y(), 0, pageHeightPoints - heightPt),
                    widthPt,
                    heightPt
                  )
                }
                onDblClick={(e) => {
                  const c = e.target.getStage()?.container();
                  if (c) c.style.cursor = "move";
                }}
                onTransformEnd={(e) => {
                  const node = e.target as Konva.Image;
                  const newW = Math.max(5, Math.abs(node.width() * node.scaleX()));
                  const newH = Math.max(5, Math.abs(node.height() * node.scaleY()));
                  node.scaleX(1);
                  node.scaleY(1);
                  commit(node.x(), node.y(), newW, newH);
                }}
              />
            )}
            {logoImg && (
              <Transformer
                ref={trRef}
                rotateEnabled={false}
                keepRatio={preserveAspect ? true : false}
                flipEnabled={false}
                anchorSize={10}
                anchorCornerRadius={3}
                borderStroke="#0e525b"
                anchorStroke="#ffffff"
                anchorFill="#2b9aa8"
                borderDash={[6, 4]}
                boundBoxFunc={(oldBox, newBox) => {
                  if (newBox.width < 5 || newBox.height < 5) return oldBox;
                  return newBox;
                }}
              />
            )}
          </Layer>
        </Stage>
      )}
      {logoImg && onResetProportion && isDistorted && (
        <button
          onClick={onResetProportion}
          className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#0e525b] shadow-lg shadow-[#0e525b]/10 transition hover:bg-white active:scale-95"
        >
          <RotateCcw className="h-3.5 w-3.5 text-[#2b9aa8]" />
          Redefinir proporção
        </button>
      )}
    </div>
  );
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}
