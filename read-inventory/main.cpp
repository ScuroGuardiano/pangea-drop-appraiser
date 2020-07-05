// Tested compilation only on mingw32 5.1.0
// Compile only to 32 bits, the best way is just to use Code::Blocks 17.12 with mingw, not newer!
// https://sourceforge.net/projects/codeblocks/files/Binaries/17.12/

#include <iostream>
#include <vector>
#include <windows.h>

#include "proc.h"

// Created with ReClass.NET 1.2 by KN4CK3R
struct Item
{
	int32_t ItemId; //0x0000
	int32_t Quantity; //0x0004
	int32_t NoFuckingIdea; //0x0008
	char itemData[64]; //0x000C
	char endChar;
}; //Size: 0x004D (aligned to 4 bytes, so it's actually 0x50 size. At least on mingw32

void printError(const char* errorMsg)
{
    std::cerr << "[ERR]: " << errorMsg << std::endl;
}

int main()
{
    const wchar_t* processName = L"NOWY_Uruchom_Gre.exe";
    const uintptr_t eqPtrBaseAdressOffset = 0x32E109C;
    const uintptr_t firstEqItemOffset = 0x74;
    const uintptr_t itemSize = 0x4D;
    const uint32_t itemsCount = 450;

    Item items[itemsCount];
    /*
        Okey, I have to use raw item data and then convert it to item array
        Because item size is aligned to 4 bytes, so it's 80 bytes long, rather than 77 bytes as it should
        So I load everything into this 77 * items bytes array and convert it to Item[] array
    */
    char rawItemData[itemSize * itemsCount];

    // Get processId
    DWORD processId = GetProcId(processName);
    if(processId == 0)
    {
        printError("Couldn't get process ID, make sure the game is running or run this on admin priviliges");
        exit(1);
    }

    // Get Module Base Adress
    uintptr_t moduleBase = GetModuleBaseAddress(processId, processName);

    // Open Process
    HANDLE hProcess = 0;
    hProcess = OpenProcess(PROCESS_VM_READ, NULL, processId);

    if(hProcess == 0)
    {
        printError("Couldn't open process. Run this program as an administrator");
        exit(1);
    }


    // Calculate base inventory pointer adress
    uintptr_t eqPtrBaseAdress = moduleBase + eqPtrBaseAdressOffset;

    uintptr_t firstItemAdress = FindDMAAddy(hProcess, eqPtrBaseAdress, { firstEqItemOffset });


    while(1) {
        std::cout << "__ITEM_ARR_BEG__" << std::endl;
        // Read all items into rawItemData
        if(ReadProcessMemory(hProcess, (LPCVOID)firstItemAdress, (LPVOID)rawItemData, sizeof(rawItemData), 0))
        {
            std::cout << "[";
            // Copy data from rawItemData to items: Item[] array
            for(int i = 0; i < itemsCount; i++)
            {
                memcpy(items + i, rawItemData + i * itemSize, itemSize);
            }

            // Print this shit to stdout
            for(int i = 0; i < itemsCount; i++) {
                std::cout << "[" << items[i].ItemId << "," << items[i].Quantity << "]";
                if((i + 1) != itemsCount)
                    std::cout << ",";
            }
            std::cout << "]";
        }
        else
        {
            printError("Can't read memory. Run this program as administrator");
            exit(1);
        }
        std::cout << std::endl << "__ITEM_ARR_END__" << std::endl;
        Sleep(2000);
    }
    return 0;
}
