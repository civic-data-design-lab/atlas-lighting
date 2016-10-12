import json

def byteify(input):
    if isinstance(input, dict):
        return {byteify(key): byteify(value)
                for key, value in input.iteritems()}
    elif isinstance(input, list):
        return [byteify(element) for element in input]
    elif isinstance(input, unicode):
        return input.encode('utf-8')
    else:
        return input


with open('chicago.json') as json_data:
    out = ""

    data = byteify(json.load(json_data))

    for d in data:
        print d["id"]
        out += str(d["id"]) +","
        out += str(d["population"]) +","
        out += str(d["income"]) +","
        out += str(format(d["averlight"], '.2f')) +"," 
        out += str(d["places"]) +","
        out += str(d["b_diversity"]) +","
        out += str(d["dev_intensity"]) +","
        out += str(d["cell_id"]) +","
        out += str(format(d["lng"], '.6f')) +","    
        out += str(format(d["lat"], '.6f')) +","
        out += str(d["inc_cat"]) +","
        out += str(d["msa"]) +"\n"

    with open("Output.csv", "w") as text_file:
        text_file.write(out)
