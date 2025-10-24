-- CreateIndex
CREATE UNIQUE INDEX "Portfolio_userId_name_key" ON "Portfolio"("userId", "name");

-- CreateIndex
CREATE INDEX "Portfolio_userId_createdAt_idx" ON "Portfolio"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Investment_portfolioId_ticker_key" ON "Investment"("portfolioId", "ticker");

-- CreateIndex
CREATE INDEX "Investment_assetType_idx" ON "Investment"("assetType");
