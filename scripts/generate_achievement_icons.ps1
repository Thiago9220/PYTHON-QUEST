param(
  [string]$OutDir = "client/public/achievements",
  [string]$WorldDir = "client/public/assets/images/worlds",
  [string]$PreviewPath = ""
)

Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"
$size = 512

function C([string]$hex, [int]$alpha = 255) {
  $h = $hex.TrimStart("#")
  return [System.Drawing.Color]::FromArgb(
    $alpha,
    [Convert]::ToInt32($h.Substring(0, 2), 16),
    [Convert]::ToInt32($h.Substring(2, 2), 16),
    [Convert]::ToInt32($h.Substring(4, 2), 16)
  )
}

function New-Brush([string]$hex, [int]$alpha = 255) {
  return [System.Drawing.SolidBrush]::new((C $hex $alpha))
}

function New-Pen([string]$hex, [float]$width = 1, [int]$alpha = 255) {
  $pen = [System.Drawing.Pen]::new((C $hex $alpha), $width)
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  return $pen
}

function New-RoundRectPath([float]$x, [float]$y, [float]$w, [float]$h, [float]$r) {
  $p = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $d = $r * 2
  $p.AddArc($x, $y, $d, $d, 180, 90)
  $p.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $p.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $p.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $p.CloseFigure()
  return $p
}

function Draw-CoverImage($g, [string]$path, [int]$canvasSize) {
  if (-not (Test-Path $path)) { return }
  $img = [System.Drawing.Image]::FromFile((Resolve-Path $path))
  try {
    $scale = [Math]::Max($canvasSize / $img.Width, $canvasSize / $img.Height)
    $sw = [int]($canvasSize / $scale)
    $sh = [int]($canvasSize / $scale)
    $sx = [int](($img.Width - $sw) / 2)
    $sy = [int](($img.Height - $sh) / 2)
    $src = [System.Drawing.Rectangle]::new($sx, $sy, $sw, $sh)
    $dst = [System.Drawing.Rectangle]::new(0, 0, $canvasSize, $canvasSize)
    $g.DrawImage($img, $dst, $src, [System.Drawing.GraphicsUnit]::Pixel)
  } finally {
    $img.Dispose()
  }
}

function Draw-CenteredText($g, [string]$text, [float]$y, [float]$height, [string]$family, [float]$sizePt, [string]$color, [string]$style = "Bold", [int]$alpha = 255) {
  $fontStyle = [System.Drawing.FontStyle]::$style
  $font = [System.Drawing.Font]::new($family, $sizePt, $fontStyle, [System.Drawing.GraphicsUnit]::Point)
  $brush = New-Brush $color $alpha
  $fmt = [System.Drawing.StringFormat]::new()
  $fmt.Alignment = [System.Drawing.StringAlignment]::Center
  $fmt.LineAlignment = [System.Drawing.StringAlignment]::Center
  try {
    $rect = [System.Drawing.RectangleF]::new(34, $y, 444, $height)
    $g.DrawString($text, $font, $brush, $rect, $fmt)
  } finally {
    $fmt.Dispose()
    $brush.Dispose()
    $font.Dispose()
  }
}

function Draw-GlowEllipse($g, [float]$x, [float]$y, [float]$w, [float]$h, [string]$color) {
  foreach ($step in @(0, 1, 2, 3)) {
    $pad = $step * 16
    $alpha = @(34, 24, 16, 10)[$step]
    $brush = New-Brush $color $alpha
    try {
      $g.FillEllipse($brush, $x - $pad, $y - $pad, $w + ($pad * 2), $h + ($pad * 2))
    } finally {
      $brush.Dispose()
    }
  }
}

function Draw-Circuit($g, [string]$accent) {
  $penSoft = New-Pen $accent 2 55
  $penMain = New-Pen $accent 3 125
  $dot = New-Brush $accent 170
  try {
    $lines = @(
      @(74, 108, 154, 108, 154, 70),
      @(358, 88, 426, 88, 426, 158),
      @(76, 410, 156, 410, 156, 448),
      @(352, 432, 430, 432, 430, 366),
      @(46, 256, 104, 256),
      @(408, 256, 466, 256)
    )
    foreach ($line in $lines) {
      $g.DrawLine($penSoft, $line[0], $line[1], $line[2], $line[3])
      if ($line.Length -eq 6) { $g.DrawLine($penMain, $line[2], $line[3], $line[4], $line[5]) }
      $g.FillEllipse($dot, $line[0] - 4, $line[1] - 4, 8, 8)
    }
  } finally {
    $dot.Dispose()
    $penMain.Dispose()
    $penSoft.Dispose()
  }
}

function Draw-WorldGlyph($g, [string]$kind, [string]$accent) {
  $pen = New-Pen $accent 9 235
  $penDim = New-Pen $accent 4 120
  try {
    switch ($kind) {
      "village" {
        $g.DrawLine($pen, 166, 314, 166, 216)
        $g.DrawLine($pen, 166, 216, 238, 166)
        $g.DrawLine($pen, 238, 166, 238, 314)
        $g.DrawLine($pen, 274, 314, 274, 184)
        $g.DrawLine($pen, 274, 184, 356, 150)
        $g.DrawLine($pen, 356, 150, 356, 314)
        foreach ($x in @(190, 214, 302, 330)) { $g.DrawRectangle($penDim, $x, 236, 14, 18) }
      }
      "valley" {
        $g.DrawLine($pen, 116, 328, 228, 186)
        $g.DrawLine($pen, 228, 186, 284, 268)
        $g.DrawLine($pen, 284, 268, 394, 154)
        $g.DrawLine($penDim, 124, 362, 398, 362)
        $g.DrawEllipse($penDim, 214, 172, 28, 28)
        $g.DrawEllipse($penDim, 380, 140, 28, 28)
      }
      "nest" {
        foreach ($r in @(152, 118, 84)) { $g.DrawEllipse($penDim, 256 - $r / 2, 256 - $r / 2, $r, $r) }
        $g.DrawLine($pen, 176, 256, 336, 256)
        $g.DrawLine($pen, 256, 176, 256, 336)
        $g.DrawLine($penDim, 202, 202, 310, 310)
        $g.DrawLine($penDim, 310, 202, 202, 310)
      }
      "mountain" {
        $g.DrawArc($penDim, 118, 304, 276, 78, 194, 152)
        $g.DrawArc($penDim, 140, 252, 232, 70, 198, 144)
        $g.DrawLine($pen, 148, 342, 244, 160)
        $g.DrawLine($pen, 244, 160, 314, 272)
        $g.DrawLine($pen, 314, 272, 392, 170)
      }
      "forest" {
        $g.DrawLine($pen, 256, 354, 256, 166)
        $g.DrawLine($penDim, 256, 244, 184, 190)
        $g.DrawLine($penDim, 256, 254, 338, 188)
        $g.DrawLine($penDim, 256, 302, 190, 278)
        $g.DrawLine($penDim, 256, 314, 340, 280)
        $g.DrawEllipse($penDim, 150, 146, 86, 86)
        $g.DrawEllipse($penDim, 300, 142, 90, 90)
      }
    }
  } finally {
    $penDim.Dispose()
    $pen.Dispose()
  }
}

function Draw-GenericGlyph($g, [string]$kind, [string]$accent) {
  $pen = New-Pen $accent 9 235
  $penThin = New-Pen $accent 4 150
  try {
    switch ($kind) {
      "terminal" {
        Draw-CenteredText $g "</>" 172 138 "Consolas" 58 "#e8fbff" "Bold"
        Draw-CenteredText $g "RUN" 314 42 "Segoe UI" 19 $accent "Bold"
      }
      "xp" {
        $g.DrawEllipse($pen, 132, 132, 248, 248)
        $g.DrawEllipse($penThin, 164, 164, 184, 184)
      }
      "hint" {
        $g.DrawEllipse($pen, 198, 134, 116, 116)
        $g.DrawLine($pen, 218, 280, 294, 280)
        $g.DrawLine($penThin, 230, 310, 282, 310)
        $g.DrawLine($penThin, 256, 88, 256, 116)
        $g.DrawLine($penThin, 166, 146, 188, 166)
        $g.DrawLine($penThin, 346, 146, 324, 166)
      }
      "nohint" {
        $g.DrawEllipse($pen, 156, 150, 200, 200)
        $g.DrawLine($pen, 178, 332, 334, 176)
        Draw-CenteredText $g "?" 182 128 "Segoe UI Black" 74 "#e8fbff" "Bold"
      }
      "target" {
        foreach ($r in @(240, 170, 92)) { $g.DrawEllipse($penThin, 256 - $r / 2, 256 - $r / 2, $r, $r) }
        $g.DrawLine($pen, 256, 126, 256, 386)
        $g.DrawLine($pen, 126, 256, 386, 256)
      }
      "core" {
        $points = [System.Drawing.Point[]]@(
          [System.Drawing.Point]::new(256, 116),
          [System.Drawing.Point]::new(366, 196),
          [System.Drawing.Point]::new(324, 342),
          [System.Drawing.Point]::new(188, 342),
          [System.Drawing.Point]::new(146, 196)
        )
        $g.DrawPolygon($pen, $points)
        $g.DrawEllipse($penThin, 204, 204, 104, 104)
        $g.DrawLine($penThin, 256, 116, 256, 204)
        $g.DrawLine($penThin, 188, 342, 226, 292)
        $g.DrawLine($penThin, 324, 342, 286, 292)
      }
      "worlds" {
        foreach ($pair in @(@(146, 146), @(274, 146), @(146, 274), @(274, 274))) {
          $g.DrawRectangle($pen, $pair[0], $pair[1], 92, 92)
        }
      }
      "streak" {
        $flame = [System.Drawing.Point[]]@(
          [System.Drawing.Point]::new(260, 104),
          [System.Drawing.Point]::new(334, 216),
          [System.Drawing.Point]::new(304, 368),
          [System.Drawing.Point]::new(208, 368),
          [System.Drawing.Point]::new(176, 230),
          [System.Drawing.Point]::new(230, 172)
        )
        $g.DrawPolygon($pen, $flame)
        $g.DrawArc($penThin, 210, 236, 92, 112, 208, 216)
      }
      "passport" {
        $g.DrawRectangle($pen, 154, 132, 204, 248)
        $g.DrawLine($penThin, 196, 132, 196, 380)
        foreach ($y in @(188, 246, 304)) { $g.DrawLine($penThin, 220, $y, 328, $y) }
        $g.DrawEllipse($penThin, 232, 194, 78, 78)
      }
      "crown" {
        $points = [System.Drawing.Point[]]@(
          [System.Drawing.Point]::new(128, 314),
          [System.Drawing.Point]::new(156, 170),
          [System.Drawing.Point]::new(226, 274),
          [System.Drawing.Point]::new(256, 132),
          [System.Drawing.Point]::new(292, 274),
          [System.Drawing.Point]::new(362, 170),
          [System.Drawing.Point]::new(388, 314)
        )
        $g.DrawLines($pen, $points)
        $g.DrawLine($pen, 142, 350, 374, 350)
      }
    }
  } finally {
    $penThin.Dispose()
    $pen.Dispose()
  }
}

function New-AchievementIcon($item) {
  $bmp = [System.Drawing.Bitmap]::new($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

  try {
    $bg = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
      [System.Drawing.Rectangle]::new(0, 0, $size, $size),
      (C "#020718"),
      (C "#061828"),
      40
    )
    $g.FillRectangle($bg, 0, 0, $size, $size)
    $bg.Dispose()

    if ($item.Bg) {
      Draw-CoverImage $g (Join-Path $WorldDir $item.Bg) $size
      $veil = New-Brush "#020718" 166
      $g.FillRectangle($veil, 0, 0, $size, $size)
      $veil.Dispose()
    }

    Draw-GlowEllipse $g 112 96 288 288 $item.Accent
    Draw-GlowEllipse $g 188 188 136 136 $item.Hot

    $edge = New-RoundRectPath 24 24 464 464 64
    $edgePen = New-Pen $item.Accent 4 185
    $edgePen2 = New-Pen $item.Hot 2 115
    $g.DrawPath($edgePen, $edge)
    $g.DrawPath($edgePen2, $edge)
    $edgePen2.Dispose()
    $edgePen.Dispose()
    $edge.Dispose()

    $panel = New-RoundRectPath 74 74 364 364 48
    $panelBrush = New-Brush "#051024" 178
    $panelPen = New-Pen $item.Accent 3 105
    $g.FillPath($panelBrush, $panel)
    $g.DrawPath($panelPen, $panel)
    $panelPen.Dispose()
    $panelBrush.Dispose()
    $panel.Dispose()

    Draw-Circuit $g $item.Accent

    if ($item.World) {
      Draw-WorldGlyph $g $item.World $item.Accent
    } else {
      Draw-GenericGlyph $g $item.Kind $item.Accent
    }

    if ($item.Main) {
      Draw-CenteredText $g $item.Main 194 92 "Segoe UI Black" $item.MainSize "#f5fbff" "Bold"
    }
    if ($item.Sub) {
      Draw-CenteredText $g $item.Sub 316 46 "Segoe UI" 20 $item.Accent "Bold"
    }

    $outPath = Join-Path $OutDir $item.File
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
  } finally {
    $g.Dispose()
    $bmp.Dispose()
  }
}

$items = @(
  @{ File = "first_query.png"; Kind = "terminal"; Accent = "#18d8ff"; Hot = "#00f0a8"; Main = ""; Sub = "" },
  @{ File = "xp_bronze.png"; Kind = "xp"; Accent = "#ff9f1a"; Hot = "#00d6ff"; Main = "250"; MainSize = 52; Sub = "XP" },
  @{ File = "xp_500.png"; Kind = "xp"; Accent = "#19d4ff"; Hot = "#a855ff"; Main = "500"; MainSize = 52; Sub = "XP" },
  @{ File = "xp_1000.png"; Kind = "xp"; Accent = "#1fffc2"; Hot = "#13a8ff"; Main = "1K"; MainSize = 62; Sub = "XP" },
  @{ File = "xp_scroll.png"; Kind = "xp"; Accent = "#b36bff"; Hot = "#00f0ff"; Main = "1.5K"; MainSize = 44; Sub = "XP" },
  @{ File = "village.png"; World = "village"; Bg = "terminal_alpha.png"; Accent = "#18d8ff"; Hot = "#00f0a8"; Main = ""; Sub = "" },
  @{ File = "valley.png"; World = "valley"; Bg = "routing_node.png"; Accent = "#25f071"; Hot = "#18d8ff"; Main = ""; Sub = "" },
  @{ File = "nest.png"; World = "nest"; Bg = "list_nest.png"; Accent = "#a855ff"; Hot = "#20e7ff"; Main = ""; Sub = "" },
  @{ File = "mountain.png"; World = "mountain"; Bg = "iteration_sector.png"; Accent = "#ff8a1a"; Hot = "#ffd166"; Main = ""; Sub = "" },
  @{ File = "forest.png"; World = "forest"; Bg = "function_repo.png"; Accent = "#26f0b3"; Hot = "#8a5cff"; Main = ""; Sub = "" },
  @{ File = "no_hints.png"; Kind = "nohint"; Accent = "#00ffc2"; Hot = "#19d4ff"; Main = ""; Sub = "" },
  @{ File = "hints.png"; Kind = "hint"; Accent = "#ffd166"; Hot = "#19d4ff"; Main = ""; Sub = "" },
  @{ File = "precision.png"; Kind = "target"; Accent = "#ff477e"; Hot = "#19d4ff"; Main = ""; Sub = "" },
  @{ File = "perfect.png"; Kind = "core"; Accent = "#f5fbff"; Hot = "#00ffc2"; Main = ""; Sub = "" },
  @{ File = "double_explorer.png"; Kind = "worlds"; Accent = "#18d8ff"; Hot = "#a855ff"; Main = "2"; MainSize = 70; Sub = "MUNDOS" },
  @{ File = "passport.png"; Kind = "passport"; Accent = "#35f28f"; Hot = "#18d8ff"; Main = ""; Sub = "" },
  @{ File = "master.png"; Kind = "crown"; Accent = "#ffd166"; Hot = "#a855ff"; Main = ""; Sub = "" },
  @{ File = "streak.png"; Kind = "streak"; Accent = "#ff8a1a"; Hot = "#ff477e"; Main = "3"; MainSize = 70; Sub = "DIAS" },
  @{ File = "ghost.png"; Kind = "streak"; Accent = "#8be9ff"; Hot = "#a855ff"; Main = "7"; MainSize = 70; Sub = "DIAS" },
  @{ File = "streak_14.png"; Kind = "streak"; Accent = "#ff477e"; Hot = "#ffd166"; Main = "14"; MainSize = 62; Sub = "DIAS" },
  @{ File = "streak_30.png"; Kind = "streak"; Accent = "#00ffc2"; Hot = "#ff8a1a"; Main = "30"; MainSize = 62; Sub = "DIAS" },
  @{ File = "xp_guru.png"; Kind = "xp"; Accent = "#f5fbff"; Hot = "#18d8ff"; Main = "3K"; MainSize = 60; Sub = "XP" },
  @{ File = "xp_5000.png"; Kind = "xp"; Accent = "#ffd166"; Hot = "#ff477e"; Main = "5K"; MainSize = 60; Sub = "XP" },
  @{ File = "precision_master.png"; Kind = "target"; Accent = "#ffd166"; Hot = "#ff477e"; Main = "10"; MainSize = 62; Sub = "FIRST" },
  @{ File = "first_try_20.png"; Kind = "target"; Accent = "#ff477e"; Hot = "#f5fbff"; Main = "20"; MainSize = 62; Sub = "FIRST" },
  @{ File = "first_hint.png"; Kind = "hint"; Accent = "#19d4ff"; Hot = "#ffd166"; Main = "1"; MainSize = 72; Sub = "DICA" },
  @{ File = "no_hints_10.png"; Kind = "nohint"; Accent = "#00ffc2"; Hot = "#f5fbff"; Main = "10"; MainSize = 62; Sub = "PURO" },
  @{ File = "four_worlds.png"; Kind = "worlds"; Accent = "#18d8ff"; Hot = "#00ffc2"; Main = "4"; MainSize = 70; Sub = "MUNDOS" },
  @{ File = "trinity.png"; Kind = "core"; Accent = "#a855ff"; Hot = "#ffd166"; Main = "3"; MainSize = 70; Sub = "PURO" },
  @{ File = "nirvana.png"; Kind = "crown"; Accent = "#f5fbff"; Hot = "#ff47d6"; Main = "ALL"; MainSize = 48; Sub = "PURO" }
)

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
foreach ($item in $items) {
  New-AchievementIcon $item
}

if ($PreviewPath) {
  $cols = 6
  $tile = 156
  $sheetW = $cols * $tile
  $rows = [Math]::Ceiling($items.Count / $cols)
  $sheetH = [int]($rows * $tile)
  $sheet = [System.Drawing.Bitmap]::new($sheetW, $sheetH)
  $sg = [System.Drawing.Graphics]::FromImage($sheet)
  $sg.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $sg.Clear((C "#020718"))
  try {
    for ($i = 0; $i -lt $items.Count; $i++) {
      $img = [System.Drawing.Image]::FromFile((Resolve-Path (Join-Path $OutDir $items[$i].File)))
      try {
        $x = ($i % $cols) * $tile + 18
        $y = [Math]::Floor($i / $cols) * $tile + 18
        $sg.DrawImage($img, $x, $y, 120, 120)
      } finally {
        $img.Dispose()
      }
    }
    $previewDir = Split-Path -Parent $PreviewPath
    if ($previewDir) { New-Item -ItemType Directory -Force -Path $previewDir | Out-Null }
    $previewFullPath = [System.IO.Path]::GetFullPath($PreviewPath)
    $fs = [System.IO.File]::Open($previewFullPath, [System.IO.FileMode]::Create, [System.IO.FileAccess]::Write)
    try {
      $sheet.Save($fs, [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
      $fs.Dispose()
    }
  } finally {
    $sg.Dispose()
    $sheet.Dispose()
  }
}

Write-Host "Generated $($items.Count) achievement icons in $OutDir"
if ($PreviewPath) { Write-Host "Preview sheet: $PreviewPath" }
