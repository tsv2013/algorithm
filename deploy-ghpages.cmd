rmdir out /s /y

md out
cd out

git clone "https://github.com/tsv2013/algorithm.git" .
git checkout gh-pages

copy ..\dist\*.* .\dist\*.*

rem git add .
rem git commit -m "Deployed to Github Pages"
rem git push "https://github.com/tsv2013/algorithm.git" master:gh-pages
