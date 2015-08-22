rmdir out /s /y

md out
cd out

git clone "https://github.com/tsv2013/algorithm.git" .
git pull "https://github.com/tsv2013/algorithm.git" gh-pages
git checkout gh-pages

copy ..\dist\*.* .\dist\*.*

git add .
git commit -m "Deployed to Github Pages"
git push "https://github.com/tsv2013/algorithm.git" master:gh-pages
