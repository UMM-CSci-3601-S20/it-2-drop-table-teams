package umm3601.note;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.mongodb.lang.Nullable;

import org.mongojack.Id;
import org.mongojack.ObjectId;

public class Note {

  @ObjectId @Id
  public String _id;

  // Jackson should consider doorBoardID nullable, but Mongo shouldn't.
  // (Notes might have a null doorBoardID while they're in transit, but not
  // when they're in the database.)
  @JsonInclude(Include.NON_NULL)
  public String doorBoardID;

  public String body;

  public String addDate;

  @Nullable @JsonInclude(Include.NON_NULL)
  public String expireDate;

  public String status;

}
