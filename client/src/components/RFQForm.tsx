import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const rfqFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  product_type: z.enum(["raw", "compound", "processed"], {
    required_error: "Product type is required",
  }),
  purity_level: z.enum(["99", "99.5", "99.9"], {
    required_error: "Purity level is required",
  }),
  quantity: z.number().positive("Quantity must be positive"),
  unit: z.string().optional(),
  target_price: z.number().positive().optional(),
  currency: z.string().optional(),
  delivery_location_country: z.string().min(1, "Country is required"),
  delivery_location_city: z.string().optional(),
  required_certifications: z.array(z.string()).optional(),
  deadline: z.string().min(1, "Deadline is required"),
});

type RFQFormValues = z.infer<typeof rfqFormSchema>;

interface RFQFormProps {
  onSubmit: (data: RFQFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function RFQForm({ onSubmit, onCancel, isLoading }: RFQFormProps) {
  const form = useForm<RFQFormValues>({
    resolver: zodResolver(rfqFormSchema),
    defaultValues: {
      unit: "ton",
      currency: "USD",
      required_certifications: [],
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>RFQ Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Lithium Carbonate 99.5% - 100 tons" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Additional details about your requirements..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="product_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="raw">Raw Lithium</SelectItem>
                    <SelectItem value="compound">Lithium Compound</SelectItem>
                    <SelectItem value="processed">Processed Lithium</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purity_level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purity Level</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select purity" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="99">99%</SelectItem>
                    <SelectItem value="99.5">99.5%</SelectItem>
                    <SelectItem value="99.9">99.9%</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="100"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <FormControl>
                  <Input placeholder="ton" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <FormControl>
                  <Input placeholder="USD" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="target_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Price (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="50000"
                  {...field}
                  onChange={(e) =>
                    field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)
                  }
                />
              </FormControl>
              <FormDescription>
                Optional target price per unit to help suppliers provide competitive quotes
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="delivery_location_country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Delivery Country</FormLabel>
                <FormControl>
                  <Input placeholder="United States" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="delivery_location_city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Delivery City (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="New York" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="deadline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Response Deadline</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormDescription>
                Suppliers must submit their quotes before this date
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? "Creating..." : "Create RFQ"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
