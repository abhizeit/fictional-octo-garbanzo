"use client";

import { useEffect, useState } from "react";
import { AsyncPaginate } from "react-select-async-paginate";
import type { GroupBase, OptionsOrGroups } from "react-select";
import { Label } from "@/components/ui/label";

export interface PaginatedAsyncSelectProps<T> {
  value?: string | number;
  onChange: (value: string | number | undefined) => void;
  fetcher: (params: {
    page: number;
    limit: number;
    search?: string;
  }) => Promise<
    | {
        data: T[];
        meta?: {
          total_pages?: number;
          last_page?: number;
          [key: string]: any;
        };
      }
    | T[]
  >;
  preloadFetcher?: (id: string | number) => Promise<T | null>;
  getOptionLabel: (item: T) => string;
  getOptionValue: (item: T) => string | number;
  label?: string;
  placeholder?: string;
  staticOptions?: { value: string | number; label: string }[];
  excludeIds?: (string | number)[];
}

export function PaginatedAsyncSelect<T>({
  value,
  onChange,
  fetcher,
  preloadFetcher,
  getOptionLabel,
  getOptionValue,
  label,
  placeholder = "Search...",
  staticOptions = [],
  excludeIds = [],
}: PaginatedAsyncSelectProps<T>) {
  const [selectedOption, setSelectedOption] = useState<{
    value: string | number;
    label: string;
  } | null>(null);

  const loadOptions = async (
    search: string,
    loadedOptions: OptionsOrGroups<
      { value: string | number; label: string },
      GroupBase<{ value: string | number; label: string }>
    >,
    additional?: { page: number },
  ) => {
    const page = additional?.page || 1;
    const limit = 10;

    try {
      const response = await fetcher({
        page,
        limit,
        search: search || undefined,
      });

      let items: T[] = [];
      let hasMore = false;
      let totalPages = 0;

      if (Array.isArray(response)) {
        items = response;
        hasMore = false;
      } else {
        items = response.data;
        const meta = response.meta;
        if (meta && (meta.total_pages || meta.last_page)) {
          totalPages = meta.total_pages || meta.last_page || 0;
          hasMore = page < totalPages;
        } else {
          hasMore = items.length === limit;
        }
      }

      const filteredItems = items.filter(
        (item) => !excludeIds.includes(getOptionValue(item)),
      );

      const options = filteredItems.map((item) => ({
        value: getOptionValue(item),
        label: getOptionLabel(item),
      }));

      const finalOptions =
        page === 1 && !search ? [...staticOptions, ...options] : options;

      return {
        options: finalOptions,
        hasMore,
        additional: {
          page: page + 1,
        },
      };
    } catch (error) {
      console.error("Error loading options:", error);
      return {
        options: [],
        hasMore: false,
        additional: {
          page: page,
        },
      };
    }
  };

  useEffect(() => {
    if (value && !selectedOption && preloadFetcher) {
      preloadFetcher(value)
        .then((item) => {
          if (item) {
            setSelectedOption({
              value: getOptionValue(item),
              label: getOptionLabel(item),
            });
          }
        })
        .catch((err) => {
          console.error("Failed to load selected item", err);
        });
    } else if (!value && selectedOption) {
      setSelectedOption(null);
    }
  }, [value, preloadFetcher, getOptionValue, getOptionLabel]);

  const handleChange = (
    option: { value: string | number; label: string } | null,
  ) => {
    setSelectedOption(option);
    onChange(option?.value);
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <AsyncPaginate
        debounceTimeout={300}
        value={selectedOption}
        loadOptions={loadOptions}
        onChange={handleChange}
        placeholder={placeholder}
        isClearable
        additional={{
          page: 1,
        }}
        styles={{
          control: (base) => ({
            ...base,
            minHeight: "36px",
            fontSize: "0.875rem",
            borderColor: "hsl(var(--input))",
            backgroundColor: "hsl(var(--background))",
            color: "hsl(var(--foreground))",
            "&:hover": {
              borderColor: "hsl(var(--input))",
            },
          }),
          menu: (base) => ({
            ...base,
            zIndex: 50,
            backgroundColor: "hsl(var(--popover))",
            borderColor: "hsl(var(--border))",
          }),
          option: (base, state) => ({
            ...base,
            fontSize: "0.875rem",
            padding: "6px 8px",
            cursor: "pointer",
            backgroundColor: state.isFocused
              ? "hsl(var(--accent))"
              : "transparent",
            color: state.isFocused
              ? "hsl(var(--accent-foreground))"
              : "hsl(var(--popover-foreground))",
            "&:active": {
              backgroundColor: "hsl(var(--accent))",
            },
          }),
          singleValue: (base) => ({
            ...base,
            color: "hsl(var(--foreground))",
          }),
          input: (base) => ({
            ...base,
            color: "hsl(var(--foreground))",
          }),
        }}
        classNames={{
          control: () =>
            "!min-h-9 !border-input !bg-background hover:!bg-background hover:!border-input",
          menu: () =>
            "!bg-popover !border !border-border !rounded-md !shadow-md",
          option: (state) =>
            state.isFocused
              ? "!bg-accent !text-accent-foreground"
              : "!bg-popover !text-popover-foreground",
          singleValue: () => "!text-foreground",
          input: () => "!text-foreground",
          placeholder: () => "!text-muted-foreground",
          menuList: () => "!p-1",
        }}
      />
    </div>
  );
}
