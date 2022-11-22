ls_card_list = open('testlist.txt', 'r').read()
types = ['Character', 'Objective', 'Effect', 'Interrupt', 'Vehicle', 'Location', 'Weapon']
with open('testlist.txt') as f:
    lines = f.readlines()
    for line in lines:
        #x finds correct model
        x = line.split()[0]
        line=line.replace(x, "")
        line=line.lstrip()
        line=line.rstrip()
        print(line)