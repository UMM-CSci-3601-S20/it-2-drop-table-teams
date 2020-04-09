package umm3601.note;

import java.time.format.DateTimeFormatter;
import java.util.Date;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.mongodb.lang.Nullable;

import org.bson.types.ObjectId;
import org.mongojack.Id;


@JsonIgnoreProperties(ignoreUnknown = true)
public class Note {

  @org.mongojack.ObjectId @Id
  public String _id;

  public String doorBoardID;

  public String body;

  //public Date addDate = new Date();

  @JsonGetter("addDate")
  public Date getAddDate () {
    return new ObjectId(_id).getDate();
  }

  // The annotations appear to contradict here, but they don't.
  // What they're saying is, "It's totally fine if this property is null,
  // but if it is we shouldn't serialize it into the document."
  @Nullable @JsonInclude(Include.NON_NULL)
  public String expireDate;

  public String status;

}
