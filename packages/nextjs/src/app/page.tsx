"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface Product {
  id: string;
  title: string;
  description: string;
  image: string;
}

interface Token extends Product {
  inMarketplace: boolean;
}

const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [phydigitalTokens, setPhydigitalTokens] = useState<Token[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const productList: Product[] = [
        {
          id: "1",
          title: "Honft",
          description: "#001 – Black Forest",
          image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8c",
        },
        {
          id: "2",
          title: "Shoe",
          description: "#002 – Red Running Shoe",
          image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86",
        },
      ];

      const tokenList: Token[] = [
        {
          id: "3",
          title: "Honft",
          description: "#003 – Oak Edition",
          image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8c",
          inMarketplace: true,
        },
        {
          id: "4",
          title: "Cap",
          description: "#004 – Blue Vintage Cap",
          image: "https://images.unsplash.com/photo-1580716581572-2a7e1b4b19b1",
          inMarketplace: false,
        },
      ];

      setProducts(productList);
      setPhydigitalTokens(tokenList);
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center px-4 md:px-12 py-8">
      <div className="text-center mb-6">
        <h1 className="font-serif text-5xl font-black tracking-tight">
          Inventory
        </h1>
        <p className="mt-2 text-xs text-gray-500">
          Here you can fully interact with your NFTs, sell them, study them,
          etc.
        </p>
      </div>

      <Tabs defaultValue="phygital" className="w-full flex items-center justify-center">
        <TabsList className="gap-2 bg-gray-100 rounded-full mb-6">
          <TabsTrigger
            value="phygital"
            className="rounded-full px-4 py-1 text-xs data-[state=active]:bg-black data-[state=active]:text-white"
          >
            Marketplace
          </TabsTrigger>
          <TabsTrigger
            value="digital"
            className="rounded-full px-4 py-1 text-xs data-[state=active]:bg-black data-[state=active]:text-white"
          >
            Your Phydigital Tokens
          </TabsTrigger>
        </TabsList>

        <TabsContent value="phygital">
          <Carousel className="w-full max-w-5xl">
            <CarouselContent>
              {products.map((product) => (
                <CarouselItem key={product.id} className="md:basis-1/3">
                  <Card className="overflow-hidden rounded-2xl">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-[300px] object-cover"
                    />
                    <CardContent className="text-center mt-4">
                      <h3 className="font-serif font-bold text-lg">
                        {product.title}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {product.description}
                      </p>
                      <div className="mt-4 flex justify-center gap-2">
                        <Button className="rounded-full px-6 text-xs">
                          Buy
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="rounded-full px-6 text-xs"
                              onClick={() => setSelectedProduct(product)}
                            >
                              Info
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                {selectedProduct?.title}
                              </DialogTitle>
                            </DialogHeader>
                            <p>{selectedProduct?.description}</p>
                            <img
                              src={selectedProduct?.image}
                              alt={selectedProduct?.title}
                              className="w-full mt-4 rounded-lg"
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </TabsContent>

        <TabsContent value="digital">
          <Button className="mb-8 rounded-full px-6 text-xs">
            Tokenise New Product
          </Button>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl w-full">
            {phydigitalTokens.map((token) => (
              <Card
                key={token.id}
                className="overflow-hidden rounded-2xl relative"
              >
                <img
                  src={token.image}
                  alt={token.title}
                  className="w-full h-[300px] object-cover"
                />
                {token.inMarketplace && (
                  <span className="absolute top-2 right-2 bg-green-100 text-green-700 text-[10px] font-semibold px-2 py-1 rounded-full">
                    In Marketplace
                  </span>
                )}
                <CardContent className="text-center mt-4">
                  <h3 className="font-serif font-bold text-lg">
                    {token.title}
                  </h3>
                  <p className="text-xs text-gray-500">{token.description}</p>
                  <div className="mt-4 flex justify-center gap-2">
                    <Button
                      className="rounded-full px-6 text-xs"
                      disabled={token.inMarketplace}
                    >
                      Sell
                    </Button>
                    {token.inMarketplace && (
                      <span className="text-xs font-semibold text-green-600">
                        Listed
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Inventory;
