@ECHO OFF
echo Dropping DB team4IterationDev
mongo team4IterationDev --eval "db.dropDatabase()"
for %%f in (seed\*.json) do (
  echo Seeding %%~nf from %%f in DB team4IterationDev
  mongoimport --db=team4IterationDev --collection=%%~nf --file=%%f --jsonArray
)
