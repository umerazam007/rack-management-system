class Item():
    def __init__(self, NameP, CategoryP, WeightP, QuantityP):
        self.__Name = NameP
        self.__Category = CategoryP
        self.__Weight = WeightP
        self.__Quantity = QuantityP

    def GetName(self):
        return self.__Name

    def GetCategory(self):
        return self.__Category

    def GetWeight(self):
        return self.__Weight

    def GetQuantity(self):
        return self.__Quantity

    def Display(self):
        print("[" + self.__Category + "] " + self.__Name + " | Qty: " + str(self.__Quantity) + " | Weight: " + str(self.__Weight) + "kg")


class Shelf():
    def __init__(self, ShelfIDP, CapacityP):
        self.__ShelfID = ShelfIDP
        self.__Capacity = CapacityP
        self.__Items = []
        self.__NumberItems = 0

    def GetShelfID(self):
        return self.__ShelfID

    def GetCapacity(self):
        return self.__Capacity

    def GetNumberItems(self):
        return self.__NumberItems

    def GetItems(self):
        return self.__Items

    def IsFull(self):
        if self.__NumberItems >= self.__Capacity:
            return True
        else:
            return False

    def AddItem(self, ItemP):
        if self.IsFull():
            return False
        else:
            self.__Items.append(ItemP)
            self.__NumberItems = self.__NumberItems + 1
            return True

    def RemoveItem(self, NameP):
        Index = 0
        while Index < self.__NumberItems:
            if self.__Items[Index].GetName().lower() == NameP.lower():
                RemovedItem = self.__Items[Index]
                self.__Items.pop(Index)
                self.__NumberItems = self.__NumberItems - 1
                return RemovedItem
            Index = Index + 1
        return None

    def SearchItems(self, QueryP):
        Results = []
        Index = 0
        while Index < self.__NumberItems:
            if QueryP.lower() in self.__Items[Index].GetName().lower() or QueryP.lower() in self.__Items[Index].GetCategory().lower():
                Results.append(self.__Items[Index])
            Index = Index + 1
        return Results

    def Display(self):
        BarFilled = int((self.__NumberItems / self.__Capacity) * 20)
        Bar = "#" * BarFilled + "-" * (20 - BarFilled)
        print("  Shelf " + str(self.__ShelfID) + " [" + Bar + "] " + str(self.__NumberItems) + "/" + str(self.__Capacity) + " items")
        if self.__NumberItems == 0:
            print("    (empty)")
        else:
            Index = 0
            while Index < self.__NumberItems:
                print("    - ", end="")
                self.__Items[Index].Display()
                Index = Index + 1


class Rack():
    def __init__(self, RackNameP, NumberShelvesP, ShelfCapacityP):
        self.__RackName = RackNameP
        self.__NumberShelves = NumberShelvesP
        self.__Shelves = []
        Count = 0
        while Count < NumberShelvesP:
            self.__Shelves.append(Shelf(Count + 1, ShelfCapacityP))
            Count = Count + 1

    def GetRackName(self):
        return self.__RackName

    def GetNumberShelves(self):
        return self.__NumberShelves

    def GetShelves(self):
        return self.__Shelves

    def AddItem(self, ItemP, ShelfIDP):
        if ShelfIDP == 0:
            Index = 0
            while Index < self.__NumberShelves:
                if not self.__Shelves[Index].IsFull():
                    self.__Shelves[Index].AddItem(ItemP)
                    print("Added '" + ItemP.GetName() + "' to Shelf " + str(self.__Shelves[Index].GetShelfID()) + " (auto-assigned).")
                    return True
                Index = Index + 1
            print("All shelves are full.")
            return False
        else:
            Index = 0
            while Index < self.__NumberShelves:
                if self.__Shelves[Index].GetShelfID() == ShelfIDP:
                    if self.__Shelves[Index].IsFull():
                        print("Shelf " + str(ShelfIDP) + " is full.")
                        return False
                    else:
                        self.__Shelves[Index].AddItem(ItemP)
                        print("Added '" + ItemP.GetName() + "' to Shelf " + str(ShelfIDP) + ".")
                        return True
                Index = Index + 1
            print("Shelf " + str(ShelfIDP) + " does not exist.")
            return False

    def RemoveItem(self, NameP, ShelfIDP):
        if ShelfIDP == 0:
            Index = 0
            while Index < self.__NumberShelves:
                Removed = self.__Shelves[Index].RemoveItem(NameP)
                if Removed is not None:
                    print("Removed '" + Removed.GetName() + "' from Shelf " + str(self.__Shelves[Index].GetShelfID()) + ".")
                    return True
                Index = Index + 1
            print("Item '" + NameP + "' not found.")
            return False
        else:
            Index = 0
            while Index < self.__NumberShelves:
                if self.__Shelves[Index].GetShelfID() == ShelfIDP:
                    Removed = self.__Shelves[Index].RemoveItem(NameP)
                    if Removed is not None:
                        print("Removed '" + Removed.GetName() + "' from Shelf " + str(ShelfIDP) + ".")
                        return True
                    else:
                        print("Item '" + NameP + "' not found on Shelf " + str(ShelfIDP) + ".")
                        return False
                Index = Index + 1
            print("Shelf " + str(ShelfIDP) + " does not exist.")
            return False

    def SearchInventory(self, QueryP):
        Results = []
        Index = 0
        while Index < self.__NumberShelves:
            Found = self.__Shelves[Index].SearchItems(QueryP)
            ShelfIndex = 0
            while ShelfIndex < len(Found):
                Results.append([self.__Shelves[Index].GetShelfID(), Found[ShelfIndex]])
                ShelfIndex = ShelfIndex + 1
            Index = Index + 1
        return Results

    def GetTotalUsed(self):
        Total = 0
        Index = 0
        while Index < self.__NumberShelves:
            Total = Total + self.__Shelves[Index].GetNumberItems()
            Index = Index + 1
        return Total

    def GetTotalCapacity(self):
        Total = 0
        Index = 0
        while Index < self.__NumberShelves:
            Total = Total + self.__Shelves[Index].GetCapacity()
            Index = Index + 1
        return Total

    def DisplayCapacity(self):
        TotalUsed = self.GetTotalUsed()
        TotalCapacity = self.GetTotalCapacity()
        Percentage = (TotalUsed / TotalCapacity) * 100
        print("Overall: " + str(TotalUsed) + "/" + str(TotalCapacity) + " items (" + str(round(Percentage, 1)) + "% full)")
        Index = 0
        while Index < self.__NumberShelves:
            Used = self.__Shelves[Index].GetNumberItems()
            Cap = self.__Shelves[Index].GetCapacity()
            ShelfPct = (Used / Cap) * 100
            if self.__Shelves[Index].IsFull():
                Status = "FULL"
            else:
                Status = "OK"
            print("  Shelf " + str(self.__Shelves[Index].GetShelfID()) + ": " + str(Used) + "/" + str(Cap) + " (" + str(round(ShelfPct, 1)) + "%) [" + Status + "]")
            Index = Index + 1

    def DisplayRack(self):
        print("=" * 45)
        print("  RACK: " + self.__RackName)
        print("  Total: " + str(self.GetTotalUsed()) + "/" + str(self.GetTotalCapacity()) + " items")
        print("=" * 45)
        Index = 0
        while Index < self.__NumberShelves:
            self.__Shelves[Index].Display()
            Index = Index + 1
        print("=" * 45)


if __name__ == "__main__":
    # ---- Main Program ----

    print("=" * 45)
    print("   STORAGE RACK MANAGEMENT SYSTEM")
    print("=" * 45)

    RackName = input("Enter rack name (default: Main Rack): ")
    if RackName == "":
        RackName = "Main Rack"

    Customise = input("Customise shelves? (y/n): ")
    if Customise.lower() == "y":
        NumberShelves = int(input("Number of shelves: "))
        ShelfCapacity = int(input("Items per shelf: "))
    else:
        NumberShelves = 4
        ShelfCapacity = 10

    MyRack = Rack(RackName, NumberShelves, ShelfCapacity)
    print("Rack '" + RackName + "' created with " + str(NumberShelves) + " shelves, " + str(ShelfCapacity) + " items each.")

    Choice = ""
    while Choice != "6":
        print("\n--- MENU ---")
        print("  1. View rack")
        print("  2. Add item")
        print("  3. Remove item")
        print("  4. Search inventory")
        print("  5. Capacity report")
        print("  6. Exit")
        Choice = input("Choose: ")

        if Choice == "1":
            MyRack.DisplayRack()

        elif Choice == "2":
            print("\n-- Add Item --")
            Name = input("  Item name: ")
            Category = input("  Category: ")
            if Category == "":
                Category = "General"
            Weight = float(input("  Weight (kg): "))
            Quantity = int(input("  Quantity: "))
            Auto = input("  Auto-assign shelf? (y/n): ")
            if Auto.lower() == "y":
                ShelfID = 0
            else:
                ShelfID = int(input("  Shelf number: "))
            NewItem = Item(Name, Category, Weight, Quantity)
            MyRack.AddItem(NewItem, ShelfID)

        elif Choice == "3":
            print("\n-- Remove Item --")
            Name = input("  Item name to remove: ")
            ByShelf = input("  Remove from specific shelf? (y/n): ")
            if ByShelf.lower() == "y":
                ShelfID = int(input("  Shelf number: "))
            else:
                ShelfID = 0
            MyRack.RemoveItem(Name, ShelfID)

        elif Choice == "4":
            print("\n-- Search Inventory --")
            Query = input("  Search (name or category): ")
            Results = MyRack.SearchInventory(Query)
            if len(Results) == 0:
                print("  No items found.")
            else:
                print("  Found " + str(len(Results)) + " result(s):")
                Index = 0
                while Index < len(Results):
                    print("  Shelf " + str(Results[Index][0]) + ": ", end="")
                    Results[Index][1].Display()
                    Index = Index + 1

        elif Choice == "5":
            print("\n-- Capacity Report --")
            MyRack.DisplayCapacity()

        elif Choice == "6":
            print("Goodbye!")

        else:
            print("Invalid choice.")
