import json
from shapely.geometry import shape, Point
import math
import csv

def main():
    print "open"
    lngs = {}
    lats = {}
#['population', 'income', 'averlight', 'places', 'b_diversity', 'dev_intensity', 'id', 'lng', 'lat', 'inc_cat']
    with open("grids_values_export_no0.csv", "rU") as f:
        reader = csv.reader(f)
        for line in reader:
            lat = line[8][0:-2]
            lngs[line[7]] = lngs.get(line[7],0)+1
            lats[lat] = lats.get(lat,0)+1
        print len(lats.keys())
       # print lngs
#    with open('result.csv', 'w') as fw:
#        writer = csv.writer(fw)
#        writer.writerows(points)
main()
