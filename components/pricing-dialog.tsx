"use client";

import { FunctionComponent, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Check, Crown, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import axios from "axios";

interface PricingDialogProps {}

type PlanName = "Free" | "Pro";

const pricingDetails = [
  {
    planName: "Free" as PlanName,
    price: 0,
    description: {
      title: "For people just getting started with AskPDF",
      items: ["Limited PDF files", "Limited generations"],
    },
  },
  {
    planName: "Pro" as PlanName,
    price: 9.99,
    description: {
      title: "All capabilities unlock",
      items: ["Unlimited PDF files", "Unlimited generations"],
    },
  },
];

const PricingDialog: FunctionComponent<PricingDialogProps> = () => {
  const [loading, setLoading] = useState(false);

  const handleSubscription = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/billing");
      window.location.href = response.data.url;
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger className="w-full">
        <Button
          variant="ghost"
          className="w-full text-gray-900 bg-purple-custom-400 hover:bg-purple-custom-500/70 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-800/50"
        >
          <Crown size={20} className="text-gray-900 dark:text-gray-300 mr-2" />
          Upgrade to Pro
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upgrade you plan</DialogTitle>
        </DialogHeader>
        <div className="flex gap-10 p-3">
          {pricingDetails.map((pd, index) => (
            <PricingOption
              key={index}
              {...pd}
              loading={loading}
              onClick={handleSubscription}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PricingDialog;

interface PricingOptionProps {
  planName: PlanName;
  price: number;
  description: {
    title: string;
    items: string[];
  };
  loading: boolean;
  onClick: () => void;
}

const PricingOption = ({
  planName,
  price,
  description,
  loading,
  onClick,
}: PricingOptionProps) => {
  return (
    <div className="flex flex-col w-64 gap-4 dark:text-gray-300 text-gray-700">
      <div>
        <p className="font-semibold dark:text-gray-100 text-gray-900">
          {planName}
        </p>
        <p>USD ${price}/month</p>
      </div>
      <Button
        disabled={planName === "Free" || loading}
        onClick={() => {
          if (planName === "Pro") {
            onClick();
          }
        }}
      >
        {planName === "Free" ? (
          "Your current plan"
        ) : (
          <>
            {loading ? (
              <Loader2
                size={20}
                className="text-gray-200 dark:text-gray-800 animate-spin"
              />
            ) : (
              "Upgrade to Pro"
            )}
          </>
        )}
      </Button>
      <div className="text-sm">
        <p className="mb-2">{description.title}</p>
        <ul>
          {description.items.map((item, index) => (
            <li key={index} className="flex items-center">
              <Check size={15} className="mr-2" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
