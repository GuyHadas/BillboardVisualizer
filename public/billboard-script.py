import billboard
from time import sleep

f = open('hot100.txt', 'w')

i = 0
chart = billboard.ChartData('hot-100')
while chart.previousDate:
    print chart.date
    if len(chart) < 10:
        chart = billboard.ChartData('hot-100', chart.previousDate)

    f.write("*****")
    f.write("\n")
    f.write(chart.date)
    f.write("\n")

    for x in range(0, 10):
        f.write(str(chart[x].title))
        f.write("\n")

        f.write(str(chart[x].artist))
        f.write("\n")

        f.write(str(chart[x].weeks))
        f.write("\n")

        f.write(str(chart[x].rank))
        f.write("\n")

        f.write(str(chart[x].spotifyID))
        f.write("\n")

        f.write(str(chart[x].spotifyLink))

        f.write("\n")

    chart = billboard.ChartData('hot-100', chart.previousDate)
    f.write("\n")
    sleep(2)
    i += 1


f.close()
