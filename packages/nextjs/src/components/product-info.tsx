import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { ProductImageCarousel } from "./product";
import { ProductMetadata } from "./confirm-product";
import { Badge } from "./ui/badge";

export function ProductInfo({ metadata }: { metadata: ProductMetadata }) {
  return (
    <Dialog>
      <DialogTrigger>
        <Button>More Info</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <ProductImageCarousel images={metadata.images} />
        <div className="text-center uppercase font-bold title text-3xl">
          {metadata.title}
        </div>
        <div className="flex justify-between flex-wrap">
          <div className="flex flex-col">
            <span className="font-bold">Brand: </span>
            {metadata.brand}
          </div>
          <div className="flex flex-col">
            <span className="font-bold">Tag: </span>{" "}
            <Badge>{metadata.category}</Badge>
          </div>
        </div>
        <div className="text-center">
          {/* <div className="font-bold">Description</div> */}
          <div>
            {metadata.description?.length > 53
              ? `${metadata.description?.slice(0, 50)} ...`
              : metadata.description}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
